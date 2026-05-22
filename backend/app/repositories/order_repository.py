from typing import Any, List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate


class CRUDOrder(CRUDBase[Order, OrderCreate, Any]):
    def create_order(
        self,
        db: Session,
        *,
        order_in: OrderCreate,
        usuario_id: int,
        total: float,
        items: List[OrderItem]
    ) -> Order:
        db_order = Order(
            usuario_id=usuario_id,
            tipo_venta=order_in.tipo_venta,
            shipping_address=order_in.shipping_address,
            phone=order_in.phone,
            total=total,
            metodo_pago="Manual Transfer / Cash",
            estado="pendiente"
        )
        db_order.items = items
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order

    def get_by_user(self, db: Session, usuario_id: int) -> List[Order]:
        return (
            db.query(Order)
            .filter(Order.usuario_id == usuario_id)
            .order_by(Order.order_date.desc())
            .all()
        )

    def get_by_id(self, db: Session, order_id: int) -> Optional[Order]:
        return db.query(Order).filter(Order.id == order_id).first()

    def update_status(self, db: Session, order_id: int, status: str) -> Optional[Order]:
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.estado = status
            db.add(order)
            db.commit()
            db.refresh(order)
        return order


order_repository = CRUDOrder(Order)
