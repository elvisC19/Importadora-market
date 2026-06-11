import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.repositories.category_repository import category_repository
from app.repositories.product_repository import product_repository
from app.schemas.product import ProductCreate, CategoryCreate


@pytest.fixture(scope="function")
def category(db: Session):
    cat_in = CategoryCreate(nombre="Electrodomésticos", descripcion="Línea blanca")
    return category_repository.create(db, obj_in=cat_in)


def test_list_offers_endpoint(client: TestClient, db: Session, category):
    # 1. Create an approved offer with stock
    prod1 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Active Offer Product",
        precio=100.0,
        stock=5,
        categoria_id=category.id,
        is_offer=True,
        offer_price=80.0
    ))
    prod1.is_approved = True
    db.add(prod1)

    # 2. Create an unapproved offer
    prod2 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Unapproved Offer Product",
        precio=100.0,
        stock=5,
        categoria_id=category.id,
        is_offer=True,
        offer_price=80.0
    ))
    db.add(prod2)

    # 3. Create an offer with no stock
    prod3 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Out of stock Offer Product",
        precio=100.0,
        stock=0,
        categoria_id=category.id,
        is_offer=True,
        offer_price=80.0
    ))
    prod3.is_approved = True
    db.add(prod3)

    db.commit()

    response = client.get("/api/v1/products/offers")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["nombre"] == "Active Offer Product"
    assert items[0]["discount_percentage"] == 20.0
    assert items[0]["final_price"] == 80.0


def test_list_new_arrivals_endpoint(client: TestClient, db: Session, category):
    from datetime import datetime, timedelta, timezone

    # 1. Product 1: Approved and new, created earlier
    prod1 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Old New Arrival",
        precio=100.0,
        stock=10,
        categoria_id=category.id,
        is_new=True
    ))
    prod1.is_approved = True
    prod1.created_at = datetime.now(timezone.utc) - timedelta(days=2)
    db.add(prod1)

    # 2. Product 2: Approved and new, created later
    prod2 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Fresh New Arrival",
        precio=120.0,
        stock=10,
        categoria_id=category.id,
        is_new=True
    ))
    prod2.is_approved = True
    prod2.created_at = datetime.now(timezone.utc) - timedelta(hours=1)
    db.add(prod2)

    db.commit()

    response = client.get("/api/v1/products/new-arrivals")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 2
    assert items[0]["nombre"] == "Fresh New Arrival"
    assert items[1]["nombre"] == "Old New Arrival"


def test_admin_set_offer_success(client: TestClient, db: Session, admin_token_headers: dict, category):
    prod = product_repository.create(db, obj_in=ProductCreate(
        nombre="Original Product",
        precio=100.0,
        categoria_id=category.id
    ))
    prod.is_approved = True
    db.add(prod)
    db.commit()

    payload = {"offer_price": 75.0}
    response = client.put(
        f"/api/v1/admin/products/{prod.id}/set-offer",
        json=payload,
        headers=admin_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_offer"] is True
    assert data["offer_price"] == 75.0
    assert data["discount_percentage"] == 25.0
    assert data["final_price"] == 75.0


def test_admin_set_offer_invalid_price_raises_400(client: TestClient, db: Session, admin_token_headers: dict, category):
    prod = product_repository.create(db, obj_in=ProductCreate(
        nombre="Original Product",
        precio=100.0,
        categoria_id=category.id
    ))
    prod.is_approved = True
    db.add(prod)
    db.commit()

    payload = {"offer_price": 105.0}
    response = client.put(
        f"/api/v1/admin/products/{prod.id}/set-offer",
        json=payload,
        headers=admin_token_headers
    )
    assert response.status_code == 400
    assert "estrictamente menor" in response.json()["detail"]


def test_admin_set_offer_not_found(client: TestClient, admin_token_headers: dict):
    payload = {"offer_price": 50.0}
    response = client.put(
        "/api/v1/admin/products/99999/set-offer",
        json=payload,
        headers=admin_token_headers
    )
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()


def test_admin_remove_offer_success(client: TestClient, db: Session, admin_token_headers: dict, category):
    prod = product_repository.create(db, obj_in=ProductCreate(
        nombre="Offer Product",
        precio=100.0,
        categoria_id=category.id,
        is_offer=True,
        offer_price=80.0
    ))
    prod.is_approved = True
    db.add(prod)
    db.commit()

    response = client.delete(
        f"/api/v1/admin/products/{prod.id}/remove-offer",
        headers=admin_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_offer"] is False
    assert data["offer_price"] is None
    assert data["discount_percentage"] is None
    assert data["final_price"] == 100.0


def test_admin_remove_offer_not_found(client: TestClient, admin_token_headers: dict):
    response = client.delete(
        "/api/v1/admin/products/99999/remove-offer",
        headers=admin_token_headers
    )
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()


def test_submit_product_endpoint(client: TestClient, db: Session, admin_token_headers: dict, category):
    payload = {
        "nombre": "Test Submitted Product",
        "precio": 120.0,
        "stock": 10,
        "categoria_id": category.id,
        "is_offer": False
    }
    response = client.post(
        "/api/v1/products/submit",
        json=payload,
        headers=admin_token_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Test Submitted Product"
    assert data["submitted_by_id"] is not None


def test_list_categories_filter_empty(client: TestClient, db: Session, category):
    # 1. We have one category from the fixture (e.g. "Electrodomésticos") which has no products yet.
    # Create another category that will have an active product
    other_cat_in = CategoryCreate(nombre="Active Category", descripcion="Has products")
    other_cat = category_repository.create(db, obj_in=other_cat_in)
    
    # Create an approved active product under other_cat
    prod = product_repository.create(db, obj_in=ProductCreate(
        nombre="Active Prod",
        precio=50.0,
        stock=5,
        categoria_id=other_cat.id
    ))
    prod.is_approved = True
    prod.is_active = True
    db.add(prod)
    
    # Create a product under the first category but make it out of stock
    prod_out = product_repository.create(db, obj_in=ProductCreate(
        nombre="Out of stock Prod",
        precio=50.0,
        stock=0,
        categoria_id=category.id
    ))
    prod_out.is_approved = True
    prod_out.is_active = True
    db.add(prod_out)
    
    db.commit()
    
    # Request categories default (should return both)
    response_all = client.get("/api/v1/categories")
    assert response_all.status_code == 200
    all_cats = response_all.json()
    assert len(all_cats) >= 2
    
    # Request categories with only_with_products=true
    response_filtered = client.get("/api/v1/categories?only_with_products=true")
    assert response_filtered.status_code == 200
    filtered_cats = response_filtered.json()
    
    # Only "Active Category" should be returned, "Electrodomésticos" has no in-stock products
    cat_names = [c["nombre"] for c in filtered_cats]
    assert "Active Category" in cat_names
    assert "Electrodomésticos" not in cat_names


