from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.repositories.order_repository import order_repository
from app.repositories.product_repository import product_repository
from app.schemas.order import OrderCreate


class OrderService:
    def create_order_from_cart(
        self, db: Session, *, order_in: OrderCreate, usuario_id: int
    ) -> Order:
        calculated_items = []
        total_general = 0.0

        # 1. Verify all items first and prepare stock updates
        for item in order_in.items:
            product = product_repository.get(db, id=item.product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con ID {item.product_id} no encontrado"
                )

            if product.stock < item.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente para el producto '{product.nombre}'. Disponible: {product.stock}, solicitado: {item.cantidad}"
                )

            # Calculate price taking active offer into account
            unit_price = (
                product.offer_price
                if (product.is_offer and product.offer_price is not None)
                else product.precio
            )
            subtotal = unit_price * item.cantidad

            # Deduct stock
            product.stock -= item.cantidad
            db.add(product)

            # Create OrderItem object
            db_item = OrderItem(
                producto_id=product.id,
                cantidad=item.cantidad,
                unit_price=unit_price,
                subtotal=subtotal
            )
            calculated_items.append(db_item)
            total_general += subtotal

        # 2. Persist order and items in a single transaction
        try:
            db_order = order_repository.create_order(
                db,
                order_in=order_in,
                usuario_id=usuario_id,
                total=total_general,
                items=calculated_items
            )
            return db_order
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al procesar el pedido en la base de datos: {str(e)}"
            )

    def get_my_orders(self, db: Session, *, usuario_id: int) -> List[Order]:
        return order_repository.get_by_user(db, usuario_id=usuario_id)

    def get_order_by_id(self, db: Session, *, order_id: int) -> Optional[Order]:
        return order_repository.get_by_id(db, order_id=order_id)

    def get_all_orders(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Order]:
        return order_repository.get_multi(db, skip=skip, limit=limit)

    def update_order_status(
        self, db: Session, *, order_id: int, status: str
    ) -> Order:
        allowed_statuses = ["pendiente", "confirmado", "entregado", "cancelado"]
        if status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Estado de pedido no permitido: {status}. Permitidos: {allowed_statuses}"
            )

        order = order_repository.get_by_id(db, order_id=order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado"
            )

        # Restore stock if updated to 'cancelado' and previous state wasn't cancelado
        if status == "cancelado" and order.estado != "cancelado":
            for item in order.items:
                product = product_repository.get(db, id=item.producto_id)
                if product:
                    product.stock += item.cantidad
                    db.add(product)

        updated_order = order_repository.update_status(db, order_id=order_id, status=status)
        return updated_order


order_service = OrderService()
