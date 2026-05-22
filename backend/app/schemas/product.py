"""Esquemas Pydantic para Categorías y Productos."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator, field_validator


# ── Category Schemas ──────────────────────────────────────
class CategoryBase(BaseModel):
    nombre: str = Field(..., min_length=2, description="Nombre de la categoría")
    descripcion: Optional[str] = Field(None, description="Descripción de la categoría")


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# ── Product Schemas ───────────────────────────────────────
class ProductCreate(BaseModel):
    nombre: str = Field(..., min_length=2, description="Nombre del producto")
    descripcion: Optional[str] = Field(None, description="Descripción del producto")
    precio: float = Field(..., gt=0, description="Precio original del producto")
    stock: int = Field(0, ge=0, description="Stock disponible")
    imagen_url: Optional[str] = Field(None, description="URL de la imagen del producto")
    video_enlace: Optional[str] = Field(None, description="Enlace del video promocional")
    categoria_id: int = Field(..., description="ID de la categoría asociada")
    is_offer: bool = Field(False, description="¿Está en oferta?")
    offer_price: Optional[float] = Field(None, description="Precio de oferta")
    is_new: bool = Field(False, description="¿Es novedad/nuevo?")
    is_featured: bool = Field(False, description="¿Es destacado?")
    submitted_by_id: Optional[int] = Field(None, description="ID del usuario que envió el producto")

    @model_validator(mode="after")
    def validate_offer(self) -> "ProductCreate":
        if self.is_offer:
            if self.offer_price is None:
                raise ValueError("Si el producto está en oferta, el precio de oferta (offer_price) es obligatorio")
            if self.offer_price >= self.precio:
                raise ValueError("El precio de oferta debe ser estrictamente menor al precio original")
        return self


class ProductUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, description="Nombre del producto")
    descripcion: Optional[str] = Field(None, description="Descripción del producto")
    precio: Optional[float] = Field(None, gt=0, description="Precio original del producto")
    stock: Optional[int] = Field(None, ge=0, description="Stock disponible")
    imagen_url: Optional[str] = Field(None, description="URL de la imagen del producto")
    video_enlace: Optional[str] = Field(None, description="Enlace del video promocional")
    categoria_id: Optional[int] = Field(None, description="ID de la categoría asociada")
    is_approved: Optional[bool] = Field(None, description="¿Está aprobado por el administrador?")
    is_offer: Optional[bool] = Field(None, description="¿Está en oferta?")
    offer_price: Optional[float] = Field(None, description="Precio de oferta")
    is_new: Optional[bool] = Field(None, description="¿Es novedad/nuevo?")
    is_featured: Optional[bool] = Field(None, description="¿Es destacado?")
    submitted_by_id: Optional[int] = Field(None, description="ID del usuario que envió el producto")
    approved_by_id: Optional[int] = Field(None, description="ID del administrador que aprobó el producto")
    approved_at: Optional[datetime] = Field(None, description="Fecha de aprobación")

    @model_validator(mode="after")
    def validate_offer_update(self) -> "ProductUpdate":
        # Si se activa la oferta, validamos que haya un precio de oferta
        is_offer = self.is_offer
        offer_price = self.offer_price
        precio = self.precio

        if is_offer is True:
            if offer_price is None:
                raise ValueError("Si el producto está en oferta, el precio de oferta (offer_price) es obligatorio")
            if precio is not None and offer_price >= precio:
                raise ValueError("El precio de oferta debe ser estrictamente menor al precio original")
        elif is_offer is None and offer_price is not None:
            # Si se actualiza el precio de oferta pero no se define is_offer, validamos contra el precio
            if precio is not None and offer_price >= precio:
                raise ValueError("El precio de oferta debe ser estrictamente menor al precio original")
        return self


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    categoria_id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    stock: int
    imagen_url: Optional[str] = None
    video_enlace: Optional[str] = None
    is_approved: bool
    is_offer: bool
    offer_price: Optional[float] = None
    is_new: bool
    is_featured: bool
    submitted_by_id: Optional[int] = None
    approved_by_id: Optional[int] = None
    approved_at: Optional[datetime] = None
    vistas_actuales: int
    created_at: datetime
    updated_at: datetime
    submitted_by: Optional[int] = None
    approval_status: Optional[str] = None

    # Relación con categoría
    categoria: Optional[CategoryResponse] = None

    # Campos calculados
    discount_percentage: Optional[float] = None
    final_price: float = 0.0

    @field_validator("submitted_by", mode="before")
    @classmethod
    def get_submitted_by_id(cls, v):
        if hasattr(v, "id"):
            return v.id
        return v

    @model_validator(mode="after")
    def compute_extra_fields(self) -> "ProductResponse":
        if self.is_offer and self.offer_price is not None:
            self.final_price = self.offer_price
            if self.precio > 0:
                self.discount_percentage = round(((self.precio - self.offer_price) / self.precio) * 100, 2)
        else:
            self.final_price = self.precio
            self.discount_percentage = None
        
        if self.submitted_by_id is not None:
            self.submitted_by = self.submitted_by_id
            
        self.approval_status = "aprobado" if self.is_approved else "pendiente"
        return self


# ── Product Filter Schema ────────────────────────────────
class ProductFilter(BaseModel):
    nombre: Optional[str] = None
    categoria_id: Optional[int] = None
    is_offer: Optional[bool] = None
    is_new: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_approved: Optional[bool] = None  # Solo para administradores
    precio_min: Optional[float] = Field(None, ge=0)
    precio_max: Optional[float] = Field(None, ge=0)
    skip: int = Field(0, ge=0)
    limit: int = Field(20, ge=1)
