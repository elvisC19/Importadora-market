"""Endpoints para el módulo de Pedidos (Hito 3)."""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_admin_user, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services.order_service import order_service

router = APIRouter()


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
        db, order_in=order_in, user_id=current_user.id
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
    return order_service.get_my_orders(db, user_id=current_user.id)


@router.get("/{order_id}", response_model=OrderResponse)
def read_order(
    *,
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene un pedido específico por su ID.
    Los clientes solo pueden ver sus propios pedidos; los admins ven cualquiera.
    """
    order = order_service.get_order_by_id(db, order_id=order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )
    # Check ownership unless admin
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este pedido",
        )
    return order


@router.get("/", response_model=List[OrderResponse])
def read_all_orders(
    *,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    order_status: Optional[str] = Query(None, alias="status"),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    _admin_user: User = Depends(get_current_admin_user),
):
    """
    Obtiene todos los pedidos registrados en la tienda (solo para administradores).
    Soporta filtro por estado, rango de fechas y paginación.
    """
    return order_service.get_all_orders(
        db,
        skip=skip,
        limit=limit,
        status_filter=order_status,
        date_from=date_from,
        date_to=date_to,
    )


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    *,
    order_id: int,
    status_in: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(get_current_admin_user),
):
    """
    Actualiza el estado de un pedido (solo para administradores).
    Estados: pending → confirmed → processing → shipped → delivered.
    Se puede cancelar desde pending, confirmed o processing.
    """
    return order_service.update_order_status(
        db, order_id=order_id, new_status=status_in.status.value
    )
