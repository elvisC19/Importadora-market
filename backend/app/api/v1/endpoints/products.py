"""Endpoints para el módulo de Catálogo de Productos (Hito 2)."""

import math
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_admin_user, get_current_user, get_current_importadora_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.category_repository import category_repository
from app.repositories.product_repository import product_repository
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.product import (
    CategoryCreate,
    CategoryResponse,
    ProductCreate,
    ProductFilter,
    ProductResponse,
    ProductUpdate,
)
from app.services.product_service import product_service

router = APIRouter()


# ══════════════════════════════════════════════════════════════
# ENDPOINTS PÚBLICOS (sin autenticación)
# ══════════════════════════════════════════════════════════════


@router.get("/products", response_model=PaginatedResponse[ProductResponse])
def list_products(
    db: Session = Depends(get_db),
    nombre: Optional[str] = Query(None, description="Buscar por nombre"),
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoría"),
    is_offer: Optional[bool] = Query(None, description="Solo ofertas"),
    is_new: Optional[bool] = Query(None, description="Solo novedades"),
    is_featured: Optional[bool] = Query(None, description="Solo destacados"),
    precio_min: Optional[float] = Query(None, ge=0, description="Precio mínimo"),
    precio_max: Optional[float] = Query(None, ge=0, description="Precio máximo"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Lista productos aprobados del catálogo público con filtros opcionales.
    """
    filters = ProductFilter(
        nombre=nombre,
        categoria_id=categoria_id,
        is_offer=is_offer,
        is_new=is_new,
        is_featured=is_featured,
        precio_min=precio_min,
        precio_max=precio_max,
        skip=skip,
        limit=limit,
    )
    products = product_service.get_products(db, filters=filters, is_admin=False)

    # Contar total para paginación (sin skip/limit)
    count_filters = filters.model_copy()
    count_filters.skip = 0
    count_filters.limit = 999999
    total = product_repository.count_filtered(db, filters=count_filters)

    return {
        "items": products,
        "total": total,
        "page": (skip // limit) + 1,
        "pages": math.ceil(total / limit) if total > 0 else 1,
    }


@router.get("/products/featured", response_model=List[ProductResponse])
def list_featured_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=20),
):
    """
    Lista los productos destacados aprobados.
    """
    return product_repository.get_featured(db, skip=skip, limit=limit)


@router.get("/products/offers", response_model=List[ProductResponse])
def list_offer_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Lista los productos en oferta aprobados.
    """
    return product_repository.get_offers(db, skip=skip, limit=limit)


@router.get("/products/new-arrivals", response_model=List[ProductResponse])
def list_new_arrival_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Lista las novedades aprobadas, ordenadas por fecha de creación descendente.
    """
    return product_repository.get_new_arrivals(db, skip=skip, limit=limit)


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Obtiene el detalle de un producto aprobado e incrementa sus vistas.
    """
    return product_service.get_product_detail(db, product_id=product_id, is_admin=False)


@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """
    Lista todas las categorías disponibles.
    """
    return product_service.get_categories(db)


# ══════════════════════════════════════════════════════════════
# ENDPOINTS PROTEGIDOS — CLIENTE AUTENTICADO
# ══════════════════════════════════════════════════════════════


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def submit_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Un cliente autenticado envía un producto para aprobación.
    El producto se crea con is_approved=False automáticamente.
    """
    return product_service.create_product(db, product_in=product_in, current_user=current_user)


# ══════════════════════════════════════════════════════════════
# ENDPOINTS PROTEGIDOS — IMPORTADORA
# ══════════════════════════════════════════════════════════════


@router.get("/importadora/my-products", response_model=List[ProductResponse])
def list_my_submitted_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_importadora_user),
):
    """
    Lista todos los productos subidos por el usuario importadora actual.
    """
    return product_service.get_my_products(db, user_id=current_user.id)


# ══════════════════════════════════════════════════════════════
# ENDPOINTS PROTEGIDOS — SOLO ADMINISTRADOR
# ══════════════════════════════════════════════════════════════


@router.get("/admin/products/pending", response_model=List[ProductResponse])
def list_pending_products(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    _current_admin: User = Depends(get_current_admin_user),
):
    """
    Lista productos pendientes de aprobación (solo admin).
    """
    filters = ProductFilter(is_approved=False, skip=skip, limit=limit)
    return product_service.get_products(db, filters=filters, is_admin=True)


@router.post("/admin/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@router.post("/products/submit", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def admin_create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_importadora_user),
):
    """
    Crea o envía un producto para aprobación. Admite importadoras y administradores.
    Si es administrador, se aprueba de inmediato. Si no, queda pendiente.
    """
    product = product_service.create_product(db, product_in=product_in, current_user=current_user)
    if current_user.role == "admin":
        product = product_service.approve_product(db, product_id=product.id, admin_id=current_user.id)
    return product


@router.put("/admin/products/{product_id}", response_model=ProductResponse)
def admin_update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Actualiza un producto existente (solo admin).
    """
    return product_service.update_product(db, product_id=product_id, product_in=product_in, user_id=current_admin.id)


@router.patch("/admin/products/{product_id}/approve", response_model=ProductResponse)
def admin_approve_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Aprueba o desaprueba un producto (toggle) (solo admin).
    """
    return product_service.toggle_approval(db, product_id=product_id, admin_id=current_admin.id)


@router.patch("/admin/products/{product_id}/visibility", response_model=ProductResponse)
def admin_toggle_featured(
    product_id: int,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin_user),
):
    """
    Alterna el estado destacado de un producto (solo admin).
    Máximo 10 productos destacados permitidos.
    """
    return product_service.toggle_featured(db, product_id=product_id)


@router.delete("/admin/products/{product_id}", response_model=MessageResponse)
def admin_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin_user),
):
    """
    Elimina un producto (solo admin).
    """
    product_service.delete_product(db, product_id=product_id)
    return {"message": "Producto eliminado correctamente"}


# ── Category Admin ────────────────────────────────────────


@router.post("/admin/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def admin_create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin_user),
):
    """
    Crea una nueva categoría (solo admin).
    """
    existing = category_repository.get_by_nombre(db, nombre=category_in.nombre)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una categoría con ese nombre.",
        )
    return category_repository.create(db, obj_in=category_in)


@router.delete("/admin/categories/{category_id}", response_model=MessageResponse)
def admin_delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin_user),
):
    """
    Elimina una categoría (solo admin).
    Si tiene productos asociados, la eliminación se propagará en cascada.
    """
    category = category_repository.get(db, id=category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
    category_repository.delete(db, id=category_id)
    return {"message": "Categoría eliminada correctamente"}
