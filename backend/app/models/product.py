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
    imagen_secundaria_url = Column(String(500), nullable=True)
    imagen_alternativa_url = Column(String(500), nullable=True)
    video_enlace = Column(String(500), nullable=True)

    is_approved = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

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
    seller = relationship("User", back_populates="products", foreign_keys=[submitted_by_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id], backref="approved_products")

    @property
    def submitted_by(self):
        return self.seller

    @property
    def submitted_by_phone(self) -> str:
        return self.seller.telefono if self.seller else None

    @property
    def seller_name(self) -> str:
        if self.seller:
            return self.seller.nombre
        from sqlalchemy.orm import object_session
        from app.models.user import User
        session = object_session(self)
        if session:
            admin = session.query(User).filter(User.id == 1).first()
            if admin:
                return admin.nombre
        return "Administrador Market"

    @property
    def seller_phone(self) -> str:
        if self.seller and self.seller.telefono:
            return self.seller.telefono
        from sqlalchemy.orm import object_session
        from app.models.user import User
        session = object_session(self)
        if session:
            admin = session.query(User).filter(User.id == 1).first()
            if admin:
                return admin.telefono
        return "70000000"

    @property
    def codigo_interno(self) -> str:
        return f"IMP-0026-0{self.id}"
