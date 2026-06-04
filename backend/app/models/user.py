"""Modelo ORM para la tabla users."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(20), default="cliente", nullable=False)
    google_id = Column(String(100), nullable=True, unique=True)
    is_online = Column(Boolean, default=False)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones
    products = relationship("Product", back_populates="seller", foreign_keys="Product.submitted_by_id")

    @hybrid_property
    def is_admin(self) -> bool:
        return self.role == "admin"

    @is_admin.setter
    def is_admin(self, value: bool):
        self.role = "admin" if value else "cliente"

    @is_admin.expression
    def is_admin(cls):
        return cls.role == "admin"

