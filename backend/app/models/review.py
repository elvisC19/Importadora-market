"""Modelo ORM para la tabla product_reviews."""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, CheckConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProductReview(Base):
    __tablename__ = "product_reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_review_rating_range"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False, comment="Calificación de 1 a 5 estrellas")
    comment = Column(Text, nullable=True, comment="Comentario opcional del cliente")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    user = relationship("User", backref="reviews")
    product = relationship("Product", backref="reviews")
