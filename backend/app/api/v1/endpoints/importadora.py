"""Endpoints para el panel de ventas de Importadoras."""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_importadora_user
from app.core.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderStatusUpdate
from app.services.order_service import order_service

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────
class ImportadoraOrderItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float


class ImportadoraOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_id: int
    order_date: datetime
    status: str
    client_name: str
    client_phone: str
    client_address: str
    client_notes: Optional[str] = None
    my_items: List[ImportadoraOrderItem]
    my_subtotal: float


class ImportadoraStatsResponse(BaseModel):
    total_orders: int
    total_revenue: float
    pending_orders: int
    top_product: Optional[str] = None


# ── Endpoints ─────────────────────────────────────────────
@router.get("/orders", response_model=List[ImportadoraOrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_importadora_user),
):
    """
    Devuelve pedidos que contengan al menos un producto de esta importadora.
    Cada pedido incluye SOLO los items que pertenecen a la importadora autenticada.
    """
    # Base query: orders that contain at least one product submitted by this user
    query = (
        db.query(Order)
        .join(OrderItem, Order.id == OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(Product.submitted_by_id == current_user.id)
    )

    if status:
        query = query.filter(Order.status == status)

    # Get unique orders (deduplicate from join)
    orders = query.distinct().order_by(Order.order_date.desc()).all()

    result = []
    for order in orders:
        # Filter only items belonging to this importadora
        my_items = []
        for item in order.items:
            if item.product and item.product.submitted_by_id == current_user.id:
                my_items.append(
                    ImportadoraOrderItem(
                        product_id=item.product_id,
                        product_name=item.product.nombre,
                        quantity=item.quantity,
                        unit_price=item.unit_price,
                        subtotal=item.subtotal,
                    )
                )

        if my_items:
            my_subtotal = sum(i.subtotal for i in my_items)
            result.append(
                ImportadoraOrderResponse(
                    order_id=order.id,
                    order_date=order.order_date,
                    status=order.status,
                    client_name=order.user.nombre if order.user else "Desconocido",
                    client_phone=order.phone,
                    client_address=order.shipping_address,
                    client_notes=order.notes,
                    my_items=my_items,
                    my_subtotal=my_subtotal,
                )
            )

    return result


@router.get("/orders/stats", response_model=ImportadoraStatsResponse)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_importadora_user),
):
    """
    Estadísticas de ventas filtradas solo por los productos de esta importadora.
    """
    # Total unique orders containing this importadora's products
    total_orders = (
        db.query(func.count(func.distinct(Order.id)))
        .join(OrderItem, Order.id == OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(Product.submitted_by_id == current_user.id)
        .scalar()
    ) or 0

    # Total revenue: sum of (quantity * unit_price) of their items
    total_revenue = (
        db.query(func.sum(OrderItem.subtotal))
        .join(Product, OrderItem.product_id == Product.id)
        .filter(Product.submitted_by_id == current_user.id)
        .scalar()
    ) or 0.0

    # Pending orders containing their products
    pending_orders = (
        db.query(func.count(func.distinct(Order.id)))
        .join(OrderItem, Order.id == OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.id)
        .filter(Product.submitted_by_id == current_user.id)
        .filter(Order.status == "pending")
        .scalar()
    ) or 0

    # Top product: product with most units sold
    top_product_row = (
        db.query(Product.nombre, func.sum(OrderItem.quantity).label("total_qty"))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .filter(Product.submitted_by_id == current_user.id)
        .group_by(Product.id)
        .order_by(func.sum(OrderItem.quantity).desc())
        .first()
    )

    top_product = top_product_row[0] if top_product_row else None

    return ImportadoraStatsResponse(
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        pending_orders=pending_orders,
        top_product=top_product,
    )


@router.put("/orders/{order_id}/status", response_model=ImportadoraOrderResponse)
def update_my_order_status(
    *,
    order_id: int,
    status_in: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_importadora_user),
):
    """
    Actualiza el estado de un pedido que contiene al menos un producto de la importadora autenticada.
    Se retorna la orden filtrada mostrando únicamente los productos que le pertenecen.
    """
    # 1. Obtener el pedido
    order = order_service.get_order_by_id(db, order_id=order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    # 2. Verificar que el pedido contenga al menos un producto de esta importadora
    has_my_product = (
        db.query(OrderItem)
        .join(Product)
        .filter(
            OrderItem.order_id == order_id,
            Product.submitted_by_id == current_user.id,
        )
        .first()
        is not None
    )

    if not has_my_product and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este pedido",
        )

    # 3. Proceder con el cambio de estado usando order_service
    updated_order = order_service.update_order_status(
        db, order_id=order_id, new_status=status_in.status.value
    )

    # 4. Construir y retornar la respuesta filtrando solo sus ítems
    my_items = []
    for item in updated_order.items:
        if item.product and item.product.submitted_by_id == current_user.id:
            my_items.append(
                ImportadoraOrderItem(
                    product_id=item.product_id,
                    product_name=item.product.nombre,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    subtotal=item.subtotal,
                )
            )

    my_subtotal = sum(i.subtotal for i in my_items)
    return ImportadoraOrderResponse(
        order_id=updated_order.id,
        order_date=updated_order.order_date,
        status=updated_order.status,
        client_name=updated_order.user.nombre if updated_order.user else "Desconocido",
        client_phone=updated_order.phone,
        client_address=updated_order.shipping_address,
        client_notes=updated_order.notes,
        my_items=my_items,
        my_subtotal=my_subtotal,
    )
