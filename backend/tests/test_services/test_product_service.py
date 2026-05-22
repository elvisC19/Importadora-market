import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.schemas.product import ProductCreate, CategoryCreate
from app.services.product_service import product_service
from app.repositories.category_repository import category_repository
from app.repositories.product_repository import product_repository

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def category(db):
    cat_in = CategoryCreate(nombre="Test Category", descripcion="Test Desc")
    return category_repository.create(db, obj_in=cat_in)

def test_create_product_sets_approved_false(db, category):
    prod_in = ProductCreate(
        nombre="Test Product",
        precio=100.0,
        categoria_id=category.id,
        is_offer=False
    )
    product = product_service.create_product(db, product_in=prod_in, user_id=1)
    
    assert product.is_approved is False
    assert product.submitted_by_id == 1

def test_get_product_detail_raises_404_unapproved_non_admin(db, category):
    # Create unapproved product directly via repository
    prod_in = ProductCreate(
        nombre="Unapproved Product",
        precio=50.0,
        categoria_id=category.id
    )
    db_prod = product_repository.create(db, obj_in=prod_in)
    
    # Non-admin access should raise 404
    with pytest.raises(HTTPException) as exc_info:
        product_service.get_product_detail(db, product_id=db_prod.id, is_admin=False)
    assert exc_info.value.status_code == 404
    
    # Admin access should succeed
    product = product_service.get_product_detail(db, product_id=db_prod.id, is_admin=True)
    assert product.id == db_prod.id


def test_get_active_offers(db, category):
    # 1. Product 1: Approved offer with stock
    prod1 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Active Offer",
        precio=100.0,
        stock=5,
        categoria_id=category.id,
        is_offer=True,
        offer_price=80.0
    ))
    prod1.is_approved = True
    db.add(prod1)

    # 2. Product 2: Approved offer with no stock
    prod2 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Out of Stock Offer",
        precio=100.0,
        stock=0,
        categoria_id=category.id,
        is_offer=True,
        offer_price=70.0
    ))
    prod2.is_approved = True
    db.add(prod2)

    # 3. Product 3: Unapproved offer with stock
    prod3 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Unapproved Offer",
        precio=100.0,
        stock=5,
        categoria_id=category.id,
        is_offer=True,
        offer_price=60.0
    ))
    db.add(prod3)

    db.commit()

    active_offers = product_service.get_active_offers(db)
    
    # Assertions
    assert len(active_offers) == 1
    assert active_offers[0].nombre == "Active Offer"
    assert active_offers[0].discount_percentage == 20.0
    assert active_offers[0].final_price == 80.0


def test_get_new_arrivals(db, category):
    from datetime import datetime, timedelta, timezone

    # 1. Product 1: Approved and new, created earlier
    prod1 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Old New Arrival",
        precio=100.0,
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
        categoria_id=category.id,
        is_new=True
    ))
    prod2.is_approved = True
    prod2.created_at = datetime.now(timezone.utc) - timedelta(hours=1)
    db.add(prod2)

    # 3. Product 3: Unapproved new arrival
    prod3 = product_repository.create(db, obj_in=ProductCreate(
        nombre="Unapproved New Arrival",
        precio=130.0,
        categoria_id=category.id,
        is_new=True
    ))
    db.add(prod3)

    db.commit()

    new_arrivals = product_service.get_new_arrivals(db)
    
    # Assertions
    assert len(new_arrivals) == 2
    # Verify descending ordering by created_at
    assert new_arrivals[0].nombre == "Fresh New Arrival"
    assert new_arrivals[1].nombre == "Old New Arrival"

