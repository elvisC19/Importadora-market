"""Endpoints para el módulo de Pedidos (Hito 3)."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_admin_user, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import order_service

router = APIRouter()


class UpdateStatusRequest(BaseModel):
    status: str


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    *,
    db: Session = Depends(get_db),
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Crea un nuevo pedido a partir de la lista de productos (carrito).
    Deduce stock y calcula precios dinámicamente.
    """
    return order_service.create_order_from_cart(
        db, order_in=order_in, usuario_id=current_user.id
    )


@router.get("/me", response_model=List[OrderResponse])
def read_my_orders(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene el historial de pedidos del cliente autenticado.
    """
    return order_service.get_my_orders(db, usuario_id=current_user.id)


@router.get("/", response_model=List[OrderResponse])
def read_all_orders(
    *,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    _admin_user: User = Depends(get_current_admin_user),
):
    """
    Obtiene todos los pedidos registrados en la tienda (solo para administradores).
    """
    return order_service.get_all_orders(db, skip=skip, limit=limit)


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    *,
    order_id: int,
    status_in: UpdateStatusRequest,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
):
    """
    Actualiza el estado de un pedido (solo para administradores).
    Estados permitidos: pendiente, confirmado, entregado, cancelado.
    """
    return order_service.update_order_status(
        db, order_id=order_id, status=status_in.status
    )
