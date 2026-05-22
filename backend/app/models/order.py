"""Modelo ORM para la tabla orders."""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tipo_venta = Column(String(50), nullable=False)
    metodo_pago = Column(String(100), default="Manual Transfer / Cash", nullable=False)
    estado = Column(String(50), default="pendiente", nullable=False)
    total = Column(Float, nullable=False)
    shipping_address = Column(String(500), nullable=False)
    phone = Column(String(50), nullable=False)
    order_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    usuario = relationship("User", backref="orders")
    items = relationship("OrderItem", back_populates="pedido", cascade="all, delete-orphan")
