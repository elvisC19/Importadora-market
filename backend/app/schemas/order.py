"""Esquemas Pydantic para pedidos (Orders) — Hito 3."""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas.product import ProductResponse


# ── Enums ─────────────────────────────────────────────────
class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


# ── Create Schemas ────────────────────────────────────────
class OrderItemCreate(BaseModel):
    product_id: int = Field(..., description="ID del producto a ordenar")
    quantity: int = Field(..., gt=0, description="Cantidad (debe ser mayor a 0)")

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        return v


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(..., description="Lista de productos a ordenar")
    shipping_address: str = Field(..., min_length=5, description="Dirección de envío")
    phone: str = Field(..., description="Teléfono de contacto")
    notes: Optional[str] = Field(None, description="Notas adicionales del pedido")

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: List[OrderItemCreate]) -> List[OrderItemCreate]:
        if not v:
            raise ValueError("La lista de productos (items) no puede estar vacía")
        return v

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 7:
            raise ValueError("El teléfono debe tener al menos 7 dígitos")
        return cleaned


# ── Status Update Schema ─────────────────────────────────
class OrderStatusUpdate(BaseModel):
    status: OrderStatus = Field(..., description="Nuevo estado del pedido")


# ── Response Schemas ──────────────────────────────────────
class OrderUserInfo(BaseModel):
    """Información básica del usuario asociado al pedido."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    nombre: str
    telefono: Optional[str] = None


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product: Optional[ProductResponse] = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    order_date: datetime
    status: str
    total_amount: float
    shipping_address: str
    phone: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    user: Optional[OrderUserInfo] = None

    @field_validator("status")
    @classmethod
    def status_label(cls, v: str) -> str:
        """Asegura que el status se devuelve como string limpio."""
        return v


# ── Filter Schema (Admin) ────────────────────────────────
class OrderFilter(BaseModel):
    status: Optional[OrderStatus] = Field(None, description="Filtrar por estado")
    date_from: Optional[datetime] = Field(None, description="Fecha de inicio (orden >= date_from)")
    date_to: Optional[datetime] = Field(None, description="Fecha de fin (orden <= date_to)")
    skip: int = Field(0, ge=0, description="Registros a saltar (paginación)")
    limit: int = Field(20, ge=1, le=100, description="Máximo de registros a devolver")

    @model_validator(mode="after")
    def validate_date_range(self) -> "OrderFilter":
        if self.date_from and self.date_to and self.date_from > self.date_to:
            raise ValueError("date_from no puede ser posterior a date_to")
        return self
