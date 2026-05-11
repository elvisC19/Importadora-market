"""Modelo ORM para la tabla users."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)
    google_id = Column(String(100), nullable=True, unique=True)
    is_online = Column(Boolean, default=False)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
