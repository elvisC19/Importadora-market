"""Tests para las estadísticas y exportación de administración — Hito 4."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.order_item import OrderItem


def test_get_dashboard_stats(
    client: TestClient, admin_token_headers: dict, db: Session
):
    # Asegurar que haya una categoría
    category = Category(nombre="Test Cat", descripcion="Test Cat Desc")
    db.add(category)
    db.commit()
    db.refresh(category)

    # Asegurar que haya un producto activo
    product = Product(
        nombre="Test Product",
        precio=100.0,
        stock=10,
        categoria_id=category.id,
        is_approved=True,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # Hacer una petición
    response = client.get(
        "/api/v1/admin/stats/dashboard", headers=admin_token_headers
    )
    assert response.status_code == 200
    content = response.json()
    assert "summary" in content
    assert "most_ordered_products" in content
    assert "orders_by_status" in content

    summary = content["summary"]
    assert "total_products" in summary
    assert "total_users" in summary
    assert "orders_today" in summary
    assert "pending_orders" in summary
    assert "total_earnings" in summary
    assert summary["total_products"] >= 1


def test_get_orders_chart(client: TestClient, admin_token_headers: dict):
    response = client.get(
        "/api/v1/admin/stats/orders-chart?days=7", headers=admin_token_headers
    )
    assert response.status_code == 200
    content = response.json()
    assert isinstance(content, list)
    assert len(content) == 7
    for item in content:
        assert "date" in item
        assert "count" in item


def test_export_orders_csv(
    client: TestClient, admin_token_headers: dict, db: Session
):
    # Crear un pedido de prueba para asegurar que el exportador maneje items
    user = db.query(User).filter(User.email == "admin@example.com").first()
    category = db.query(Category).first()
    if not category:
        category = Category(nombre="Test Cat", descripcion="Test Cat Desc")
        db.add(category)
        db.commit()
        db.refresh(category)
        
    product = db.query(Product).first()
    if not product:
        product = Product(
            nombre="Test Product",
            precio=100.0,
            stock=10,
            categoria_id=category.id,
            is_approved=True,
        )
        db.add(product)
        db.commit()
        db.refresh(product)

    order = Order(
        user_id=user.id,
        shipping_address="Calle 123",
        phone="71234567",
        total_amount=200.0,
        status="pending",
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        quantity=2,
        unit_price=100.0,
        subtotal=200.0,
    )
    db.add(item)
    db.commit()

    response = client.get(
        "/api/v1/admin/orders/export", headers=admin_token_headers
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment" in response.headers["content-disposition"]
    csv_text = response.text
    # Debe contener la cabecera del CSV
    assert "ID Pedido" in csv_text
    assert "Total Pedido (Bs)" in csv_text
    # Debe contener los datos del pedido creado
    assert "Calle 123" in csv_text
    assert "Test Product" in csv_text
