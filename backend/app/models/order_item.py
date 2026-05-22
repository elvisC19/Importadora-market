"""Modelo ORM para la tabla order_items."""

from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pedido_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    producto_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    # Relaciones
    pedido = relationship("Order", back_populates="items")
    producto = relationship("Product", backref="order_items")
