"""Esquemas Pydantic para el módulo de reseñas de productos."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    """Esquema para crear una reseña. El comentario es completamente opcional."""
    rating: int = Field(..., ge=1, le=5, description="Calificación de 1 a 5 estrellas")
    comment: Optional[str] = Field(None, max_length=1000, description="Comentario opcional del cliente")


class ReviewUserInfo(BaseModel):
    """Información mínima del usuario que dejó la reseña."""
    id: int
    nombre: str

    class Config:
        from_attributes = True


class ReviewResponse(BaseModel):
    """Esquema de respuesta de una reseña."""
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    user: Optional[ReviewUserInfo] = None

    class Config:
        from_attributes = True
