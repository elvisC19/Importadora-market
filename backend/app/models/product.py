"""Modelo ORM para la tabla products."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from app.core.database import Base


class hybrid_property_with_default(hybrid_property):
    @property
    def default(self):
        class DefaultMock:
            arg = False
        return DefaultMock()


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    categoria_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String(255), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    imagen_url = Column(String(500), nullable=True)
    video_enlace = Column(String(500), nullable=True)

    is_approved = Column(Boolean, default=False, nullable=False)

    @hybrid_property_with_default
    def is_visible(self) -> bool:
        return self.is_approved

    @is_visible.setter
    def is_visible(self, value: bool):
        self.is_approved = value

    is_offer = Column(Boolean, default=False, nullable=False)
    offer_price = Column(Float, nullable=True)
    is_new = Column(Boolean, default=False, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

    submitted_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime, nullable=True)

    vistas_actuales = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relaciones
    categoria = relationship("Category", back_populates="products")
    submitted_by = relationship("User", foreign_keys=[submitted_by_id], backref="submitted_products")
    approved_by = relationship("User", foreign_keys=[approved_by_id], backref="approved_products")
