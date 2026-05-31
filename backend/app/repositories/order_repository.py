"""Repositorio CRUD para pedidos (Orders) — Hito 3."""

from datetime import datetime, timezone
from typing import Any, List, Optional

from sqlalchemy.orm import Session, joinedload

from app.models.order import Order
from app.models.order_item import OrderItem
from app.repositories.base import CRUDBase
from app.schemas.order import OrderCreate


class CRUDOrder(CRUDBase[Order, OrderCreate, Any]):
    def create_order(
        self,
        db: Session,
        *,
        order_in: OrderCreate,
        user_id: int,
        total_amount: float,
        items: List[OrderItem],
    ) -> Order:
        db_order = Order(
            user_id=user_id,
            shipping_address=order_in.shipping_address,
            phone=order_in.phone,
            notes=order_in.notes,
            total_amount=total_amount,
            status="pending",
        )
        db_order.items = items
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order

    def get_by_user(self, db: Session, user_id: int) -> List[Order]:
        return (
            db.query(Order)
            .options(joinedload(Order.items).joinedload(OrderItem.product))
            .filter(Order.user_id == user_id)
            .order_by(Order.order_date.desc())
            .all()
        )

    def get_by_id(self, db: Session, order_id: int) -> Optional[Order]:
        return (
            db.query(Order)
            .options(
                joinedload(Order.items).joinedload(OrderItem.product),
                joinedload(Order.user),
            )
            .filter(Order.id == order_id)
            .first()
        )

    def get_all(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> List[Order]:
        query = (
            db.query(Order)
            .options(
                joinedload(Order.items).joinedload(OrderItem.product),
                joinedload(Order.user),
            )
        )
        if status:
            query = query.filter(Order.status == status)
        if date_from:
            query = query.filter(Order.order_date >= date_from)
        if date_to:
            query = query.filter(Order.order_date <= date_to)

        return query.order_by(Order.order_date.desc()).offset(skip).limit(limit).all()

    def count_all(
        self,
        db: Session,
        *,
        status: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> int:
        query = db.query(Order)
        if status:
            query = query.filter(Order.status == status)
        if date_from:
            query = query.filter(Order.order_date >= date_from)
        if date_to:
            query = query.filter(Order.order_date <= date_to)
        return query.count()

    def update_status(
        self, db: Session, order_id: int, new_status: str
    ) -> Optional[Order]:
        order = self.get_by_id(db, order_id=order_id)
        if order:
            order.status = new_status
            order.updated_at = datetime.now(timezone.utc)
            db.add(order)
            db.commit()
            db.refresh(order)
        return order


order_repository = CRUDOrder(Order)
