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
        grouped_items = {}  # seller_id -> list of (product, quantity, unit_price, subtotal)

        try:
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

                # Determine seller_id (fallback to 1 if None)
                seller_id = product.submitted_by_id if product.submitted_by_id is not None else 1

                if seller_id not in grouped_items:
                    grouped_items[seller_id] = []
                grouped_items[seller_id].append((product, item.quantity, unit_price, subtotal))

            created_orders = []

            # 2. Persist orders and items in a single transaction
            for seller_id, items_info in grouped_items.items():
                total_amount = sum(info[3] for info in items_info)
                
                db_order = Order(
                    user_id=user_id,
                    shipping_address=order_in.shipping_address,
                    phone=order_in.phone,
                    notes=order_in.notes,
                    total_amount=total_amount,
                    status="pending",
                )
                
                order_items = []
                for product, qty, unit_price, subtotal in items_info:
                    db_item = OrderItem(
                        product_id=product.id,
                        quantity=qty,
                        unit_price=unit_price,
                        subtotal=subtotal,
                    )
                    order_items.append(db_item)
                
                db_order.items = order_items
                db.add(db_order)
                created_orders.append(db_order)

            # Commit the transaction
            db.commit()

            # Refresh and send email notifications
            for db_order in created_orders:
                db.refresh(db_order)
                try:
                    from app.services.email_service import email_service
                    email_service.send_order_confirmation(db_order)
                except Exception as email_err:
                    import logging
                    logging.getLogger(__name__).warning(
                        f"Error al enviar confirmación por correo para pedido #{db_order.id}: {str(email_err)}"
                    )

            if created_orders:
                return created_orders[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se crearon pedidos a partir del carrito.",
                )

        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
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
