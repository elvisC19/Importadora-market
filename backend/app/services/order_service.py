"""Servicio de negocio para pedidos (Orders) — Hito 3."""

from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.order_item import OrderItem
from app.repositories.order_repository import order_repository
from app.repositories.product_repository import product_repository
from app.schemas.order import OrderCreate, OrderStatus


class OrderService:
    # Allowed status transitions (from -> [to])
    STATUS_TRANSITIONS = {
        "pending": ["confirmed", "cancelled"],
        "confirmed": ["processing", "cancelled"],
        "processing": ["shipped", "cancelled"],
        "shipped": ["delivered"],
        "delivered": [],
        "cancelled": [],
    }

    def create_order_from_cart(
        self, db: Session, *, order_in: OrderCreate, user_id: int
    ) -> Order:
        calculated_items = []
        total_general = 0.0

        # 1. Verify all items and prepare stock updates
        for item in order_in.items:
            product = product_repository.get(db, id=item.product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con ID {item.product_id} no encontrado",
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente para el producto '{product.nombre}'. "
                    f"Disponible: {product.stock}, solicitado: {item.quantity}",
                )

            # Calculate price taking active offer into account
            unit_price = (
                product.offer_price
                if (product.is_offer and product.offer_price is not None)
                else product.precio
            )
            subtotal = unit_price * item.quantity

            # Deduct stock
            product.stock -= item.quantity
            db.add(product)

            # Create OrderItem object
            db_item = OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,
                subtotal=subtotal,
            )
            calculated_items.append(db_item)
            total_general += subtotal

        # 2. Persist order and items in a single transaction
        try:
            db_order = order_repository.create_order(
                db,
                order_in=order_in,
                user_id=user_id,
                total_amount=total_general,
                items=calculated_items,
            )
            
            # Enviar correo de confirmación de pedido
            try:
                from app.services.email_service import email_service
                email_service.send_order_confirmation(db_order)
            except Exception as email_err:
                import logging
                logging.getLogger(__name__).warning(
                    f"Error al enviar confirmación por correo para pedido #{db_order.id}: {str(email_err)}"
                )

            return db_order
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al procesar el pedido en la base de datos: {str(e)}",
            )

    def get_my_orders(self, db: Session, *, user_id: int) -> List[Order]:
        return order_repository.get_by_user(db, user_id=user_id)

    def get_order_by_id(self, db: Session, *, order_id: int) -> Optional[Order]:
        return order_repository.get_by_id(db, order_id=order_id)

    def get_all_orders(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        status_filter: Optional[str] = None,
        date_from=None,
        date_to=None,
    ) -> List[Order]:
        return order_repository.get_all(
            db,
            skip=skip,
            limit=limit,
            status=status_filter,
            date_from=date_from,
            date_to=date_to,
        )

    def count_all_orders(
        self,
        db: Session,
        *,
        status_filter: Optional[str] = None,
        date_from=None,
        date_to=None,
    ) -> int:
        return order_repository.count_all(
            db,
            status=status_filter,
            date_from=date_from,
            date_to=date_to,
        )

    def update_order_status(
        self, db: Session, *, order_id: int, new_status: str
    ) -> Order:
        # Validate the new status value via enum
        try:
            validated_status = OrderStatus(new_status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Estado de pedido no válido: '{new_status}'. "
                f"Permitidos: {[s.value for s in OrderStatus]}",
            )

        order = order_repository.get_by_id(db, order_id=order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado",
            )

        # Validate status transition
        allowed_next = self.STATUS_TRANSITIONS.get(order.status, [])
        if validated_status.value not in allowed_next:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No se puede cambiar el estado de '{order.status}' a "
                f"'{validated_status.value}'. Transiciones permitidas: {allowed_next}",
            )

        # Restore stock if cancelling
        if validated_status.value == "cancelled" and order.status != "cancelled":
            for item in order.items:
                product = product_repository.get(db, id=item.product_id)
                if product:
                    product.stock += item.quantity
                    db.add(product)

        old_status = order.status
        updated_order = order_repository.update_status(
            db, order_id=order_id, new_status=validated_status.value
        )
        
        # Enviar correo de cambio de estado de pedido
        if updated_order and old_status != validated_status.value:
            try:
                from app.services.email_service import email_service
                email_service.send_order_status_change(
                    updated_order, old_status, validated_status.value
                )
            except Exception as email_err:
                import logging
                logging.getLogger(__name__).warning(
                    f"Error al enviar correo de cambio de estado para pedido #{updated_order.id}: {str(email_err)}"
                )

        return updated_order


order_service = OrderService()
