import pytest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.models.category import Category
from app.models.product import Product
from app.models.user import User


def get_token_for_user(client, email, password):
    login_payload = {"email": email, "password": password}
    response = client.post("/api/v1/auth/login", json=login_payload)
    if response.status_code != 200:
        raise Exception(f"Login failed: {response.json()}")
    return response.json()["access_token"]


def create_test_product(
    db: Session,
    nombre: str,
    precio: float,
    stock: int,
    is_offer: bool = False,
    offer_price: float = None
) -> Product:
    category = Category(nombre=f"Cat-{nombre}", descripcion="Desc")
    db.add(category)
    db.commit()
    db.refresh(category)

    product = Product(
        categoria_id=category.id,
        nombre=nombre,
        precio=precio,
        stock=stock,
        is_offer=is_offer,
        offer_price=offer_price,
        is_approved=True
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def test_create_order_success(client: TestClient, db: Session):
    # 1. Register customer
    customer_payload = {
        "email": "customer@example.com",
        "nombre": "Juan Pérez",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=customer_payload)
    token = get_token_for_user(client, "customer@example.com", "password123")

    # 2. Create products
    p1 = create_test_product(db, nombre="Asus Laptop", precio=1000.0, stock=5)
    p2 = create_test_product(
        db,
        nombre="Polo Shirt",
        precio=100.0,
        stock=10,
        is_offer=True,
        offer_price=80.0
    )

    # 3. Create order
    order_payload = {
        "tipo_venta": "retail",
        "shipping_address": "Av. Arce 1234, La Paz",
        "phone": "71234567",
        "items": [
            {"product_id": p1.id, "cantidad": 2},
            {"product_id": p2.id, "cantidad": 3}
        ]
    }

    response = client.post(
        "/api/v1/orders/",
        json=order_payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 201
    res_data = response.json()
    assert res_data["tipo_venta"] == "retail"
    assert res_data["shipping_address"] == "Av. Arce 1234, La Paz"
    assert res_data["phone"] == "71234567"
    assert res_data["estado"] == "pendiente"
    assert res_data["metodo_pago"] == "Manual Transfer / Cash"

    # Dynamic total check: 2 * 1000.0 + 3 * 80.0 = 2240.0
    assert res_data["total"] == 2240.0
    assert len(res_data["items"]) == 2

    # Stock reduction check
    db.refresh(p1)
    db.refresh(p2)
    assert p1.stock == 3
    assert p2.stock == 7


def test_create_order_insufficient_stock_raises_400(client: TestClient, db: Session):
    # 1. Register customer
    customer_payload = {
        "email": "customer2@example.com",
        "nombre": "Juan Pérez 2",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=customer_payload)
    token = get_token_for_user(client, "customer2@example.com", "password123")

    # 2. Create product
    p1 = create_test_product(db, nombre="Asus Laptop 2", precio=1000.0, stock=1)

    # 3. Create order requesting 2 items (available: 1)
    order_payload = {
        "tipo_venta": "retail",
        "shipping_address": "Av. Arce 1234, La Paz",
        "phone": "71234567",
        "items": [
            {"product_id": p1.id, "cantidad": 2}
        ]
    }

    response = client.post(
        "/api/v1/orders/",
        json=order_payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 400
    assert "insuficiente" in response.json()["detail"].lower()

    # Stock should NOT change due to rollback
    db.refresh(p1)
    assert p1.stock == 1


def test_create_order_invalid_phone_raises_422(client: TestClient, db: Session):
    customer_payload = {
        "email": "customer3@example.com",
        "nombre": "Juan Pérez 3",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=customer_payload)
    token = get_token_for_user(client, "customer3@example.com", "password123")

    p1 = create_test_product(db, nombre="Asus Laptop 3", precio=1000.0, stock=5)

    # Bolivian phone must be 8 digits starting with 6 or 7
    order_payload = {
        "tipo_venta": "retail",
        "shipping_address": "Av. Arce 1234, La Paz",
        "phone": "12345678",  # Invalid prefix
        "items": [
            {"product_id": p1.id, "cantidad": 1}
        ]
    }

    response = client.post(
        "/api/v1/orders/",
        json=order_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422


def test_read_my_orders(client: TestClient, db: Session):
    customer_payload = {
        "email": "customer_history@example.com",
        "nombre": "Juan Historial",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=customer_payload)
    token = get_token_for_user(
        client, "customer_history@example.com", "password123"
    )

    p1 = create_test_product(db, nombre="Asus Laptop 4", precio=1000.0, stock=5)

    order_payload = {
        "tipo_venta": "retail",
        "shipping_address": "Av. Arce 1234, La Paz",
        "phone": "71234567",
        "items": [
            {"product_id": p1.id, "cantidad": 1}
        ]
    }

    # Create order
    client.post(
        "/api/v1/orders/",
        json=order_payload,
        headers={"Authorization": f"Bearer {token}"}
    )

    # Get history
    response = client.get(
        "/api/v1/orders/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["shipping_address"] == "Av. Arce 1234, La Paz"


def test_admin_endpoints(client: TestClient, db: Session, admin_token_headers):
    # 1. Place order as client
    customer_payload = {
        "email": "customer_admin_test@example.com",
        "nombre": "Juan Historial",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=customer_payload)
    client_token = get_token_for_user(
        client, "customer_admin_test@example.com", "password123"
    )

    p1 = create_test_product(db, nombre="Asus Laptop 5", precio=1000.0, stock=5)

    order_payload = {
        "tipo_venta": "retail",
        "shipping_address": "Av. Arce 1234, La Paz",
        "phone": "71234567",
        "items": [
            {"product_id": p1.id, "cantidad": 1}
        ]
    }

    order_res = client.post(
        "/api/v1/orders/",
        json=order_payload,
        headers={"Authorization": f"Bearer {client_token}"}
    )
    order_id = order_res.json()["id"]

    # 2. Get all orders as regular user (should fail with 403)
    response_client = client.get(
        "/api/v1/orders/",
        headers={"Authorization": f"Bearer {client_token}"}
    )
    assert response_client.status_code == 403

    # 3. Get all orders as admin (should succeed)
    response_admin = client.get(
        "/api/v1/orders/",
        headers=admin_token_headers
    )
    assert response_admin.status_code == 200
    assert len(response_admin.json()) >= 1

    # 4. Update status as admin
    response_status = client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "confirmado"},
        headers=admin_token_headers
    )
    assert response_status.status_code == 200
    assert response_status.json()["estado"] == "confirmado"

    # 5. Cancel order and verify stock recovery
    response_cancel = client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "cancelado"},
        headers=admin_token_headers
    )
    assert response_cancel.status_code == 200
    assert response_cancel.json()["estado"] == "cancelado"

    # Stock should be restored from 4 back to 5
    db.refresh(p1)
    assert p1.stock == 5
