import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.repositories.user_repository import user_repository
from app.schemas.user import UserCreate, UserUpdate
from app.models.user import User

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

def test_create_user(db):
    user_in = UserCreate(email="test@example.com", nombre="Test User", password="password123", telefono="71234567")
    user = user_repository.create(db, obj_in=user_in)
    assert user.email == user_in.email
    assert user.nombre == user_in.nombre
    assert hasattr(user, "id")

def test_get_by_email(db):
    user_in = UserCreate(email="test2@example.com", nombre="Test User 2", password="password123", telefono="61234567")
    user_repository.create(db, obj_in=user_in)
    user = user_repository.get_by_email(db, email=user_in.email)
    assert user is not None
    assert user.email == user_in.email

def test_update_user(db):
    user_in = UserCreate(email="test3@example.com", nombre="Test User 3", password="password123")
    user = user_repository.create(db, obj_in=user_in)
    user_update = UserUpdate(nombre="Updated Name")
    updated_user = user_repository.update(db, db_obj=user, obj_in=user_update)
    assert updated_user.nombre == "Updated Name"

def test_delete_user(db):
    user_in = UserCreate(email="test4@example.com", nombre="Test User 4", password="password123")
    user = user_repository.create(db, obj_in=user_in)
    deleted_user = user_repository.delete(db, id=user.id)
    user_check = user_repository.get(db, id=user.id)
    assert user_check is None
    assert deleted_user.id == user.id
