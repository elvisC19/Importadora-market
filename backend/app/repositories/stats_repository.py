"""Repositorio de base de datos para estadísticas — Hito 4."""

from datetime import datetime, timedelta, timezone
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User


class StatsRepository:
    def count_orders_by_day(self, db: Session, days: int = 7) -> list:
        """
        Retorna la cantidad de pedidos agrupados por día de los últimos N días.
        """
        # Calcular fecha de inicio hace N días a las 00:00:00 UTC
        start_date = datetime.now(timezone.utc) - timedelta(days=days - 1)
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)

        results = (
            db.query(
                func.date(Order.order_date).label("date"),
                func.count(Order.id).label("count")
            )
            .filter(Order.order_date >= start_date)
            .group_by(func.date(Order.order_date))
            .order_by(func.date(Order.order_date).asc())
            .all()
        )
        return [{"date": r.date, "count": r.count} for r in results]

    def get_dashboard_summary(self, db: Session) -> dict:
        """
        Retorna las métricas clave para el panel del administrador:
        total productos activos, total usuarios, pedidos hoy, pedidos pendientes, ingresos totales.
        """
        # Total productos activos
        total_products = db.query(Product).filter(Product.is_approved == True).count()

        # Total usuarios
        total_users = db.query(User).count()

        # Pedidos hoy (UTC)
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        orders_today = db.query(Order).filter(Order.order_date >= today_start).count()

        # Pedidos pendientes
        pending_orders = db.query(Order).filter(Order.status == "pending").count()

        # Ingresos totales (excluyendo pedidos cancelados)
        total_earnings = db.query(func.sum(Order.total_amount)).filter(Order.status != "cancelled").scalar() or 0.0

        return {
            "total_products": total_products,
            "total_users": total_users,
            "orders_today": orders_today,
            "pending_orders": pending_orders,
            "total_earnings": float(total_earnings)
        }

    def get_most_ordered_products(self, db: Session, limit: int = 5) -> list:
        """
        Retorna los productos más pedidos junto con su cantidad total ordenada.
        Excluye pedidos cancelados.
        """
        results = (
            db.query(
                Product.id.label("product_id"),
                Product.nombre.label("nombre"),
                func.sum(OrderItem.quantity).label("total_quantity")
            )
            .join(OrderItem, Product.id == OrderItem.product_id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(Order.status != "cancelled")
            .group_by(Product.id, Product.nombre)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "product_id": r.product_id,
                "nombre": r.nombre,
                "total_quantity": int(r.total_quantity or 0)
            }
            for r in results
        ]

    def get_orders_count_by_status(self, db: Session) -> list:
        """
        Retorna la cantidad de pedidos agrupados por estado.
        """
        results = (
            db.query(
                Order.status.label("status"),
                func.count(Order.id).label("count")
            )
            .group_by(Order.status)
            .all()
        )
        return [{"status": r.status, "count": r.count} for r in results]


stats_repository = StatsRepository()
