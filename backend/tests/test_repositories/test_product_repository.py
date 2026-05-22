import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.repositories.category_repository import category_repository
from app.repositories.product_repository import product_repository
from app.schemas.product import ProductCreate, ProductFilter, CategoryCreate


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
    cat_in = CategoryCreate(nombre="Electrodomésticos", descripcion="Línea blanca")
    return category_repository.create(db, obj_in=cat_in)


def test_filter_by_name(db, category):
    # 1. Create products
    prod1_in = ProductCreate(
        nombre="Televisor Sony 55",
        precio=450.0,
        stock=10,
        categoria_id=category.id
    )
    prod2_in = ProductCreate(
        nombre="Lavadora Samsung",
        precio=600.0,
        stock=5,
        categoria_id=category.id
    )
    product_repository.create(db, obj_in=prod1_in)
    product_repository.create(db, obj_in=prod2_in)

    # 2. Filter by name "Sony"
    filters = ProductFilter(nombre="Sony")
    results = product_repository.get_all_filtered(db, filters=filters)
    assert len(results) == 1
    assert results[0].nombre == "Televisor Sony 55"


def test_get_offers_approved_only(db, category):
    # 1. Product 1: Approved offer
    prod1_in = ProductCreate(
        nombre="Celular Oferta Aprobada",
        precio=300.0,
        categoria_id=category.id,
        is_offer=True,
        offer_price=250.0
    )
    db_prod1 = product_repository.create(db, obj_in=prod1_in)
    db_prod1.is_approved = True
    db.add(db_prod1)
    db.commit()

    # 2. Product 2: Unapproved offer
    prod2_in = ProductCreate(
        nombre="Celular Oferta Pendiente",
        precio=200.0,
        categoria_id=category.id,
        is_offer=True,
        offer_price=150.0
    )
    product_repository.create(db, obj_in=prod2_in)

    # 3. Fetch offers
    offers = product_repository.get_offers(db)
    assert len(offers) == 1
    assert offers[0].nombre == "Celular Oferta Aprobada"


def test_count_featured(db, category):
    # 1. Create products
    prod1_in = ProductCreate(
        nombre="Destacado 1",
        precio=100.0,
        categoria_id=category.id,
        is_featured=True
    )
    prod2_in = ProductCreate(
        nombre="Destacado 2",
        precio=150.0,
        categoria_id=category.id,
        is_featured=True
    )
    prod3_in = ProductCreate(
        nombre="No Destacado",
        precio=80.0,
        categoria_id=category.id,
        is_featured=False
    )
    product_repository.create(db, obj_in=prod1_in)
    product_repository.create(db, obj_in=prod2_in)
    product_repository.create(db, obj_in=prod3_in)

    # 2. Count featured products
    count = product_repository.count_featured(db)
    assert count == 2
