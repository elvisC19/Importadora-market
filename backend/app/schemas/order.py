"""Esquemas Pydantic para pedidos (Orders)."""

import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.product import ProductResponse

_BOLIVIAN_PHONE_RE = re.compile(r"^[67]\d{7}$")


class OrderItemCreate(BaseModel):
    product_id: int
    cantidad: int

    @field_validator("cantidad")
    @classmethod
    def cantidad_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        return v


class OrderCreate(BaseModel):
    tipo_venta: str
    shipping_address: str
    phone: str
    items: List[OrderItemCreate]

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: List[OrderItemCreate]) -> List[OrderItemCreate]:
        if not v:
            raise ValueError("La lista de productos (items) no puede estar vacía")
        return v

    @field_validator("phone")
    @classmethod
    def phone_bolivian(cls, v: str) -> str:
        if not _BOLIVIAN_PHONE_RE.match(v):
            raise ValueError(
                "El teléfono debe ser un número boliviano válido (8 dígitos que comienzan con 6 o 7)"
            )
        return v

    @field_validator("tipo_venta")
    @classmethod
    def validate_tipo_venta(cls, v: str) -> str:
        if v not in ("retail", "wholesale"):
            raise ValueError("El tipo de venta debe ser 'retail' o 'wholesale'")
        return v


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pedido_id: int
    producto_id: int
    cantidad: int
    unit_price: float
    subtotal: float
    producto: Optional[ProductResponse] = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    tipo_venta: str
    metodo_pago: str
    estado: str
    total: float
    shipping_address: str
    phone: str
    order_date: datetime
    items: List[OrderItemResponse] = []
