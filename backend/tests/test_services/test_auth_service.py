import pytest
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.services.auth_service import auth_service
from app.schemas.user import UserCreate
from app.core.security import verify_password

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

def test_register_user_success(db):
    user_in = UserCreate(email="success@example.com", nombre="Success", password="password123")
    user = auth_service.register_user(db, user_in=user_in)
    assert user.email == user_in.email
    assert verify_password(user_in.password, user.password_hash)

def test_register_duplicate_email_raises(db):
    user_in = UserCreate(email="dup@example.com", nombre="Dup", password="password123")
    auth_service.register_user(db, user_in=user_in)
    with pytest.raises(HTTPException) as exc:
        auth_service.register_user(db, user_in=user_in)
    assert exc.value.status_code == 400

def test_authenticate_user_success(db):
    email = "auth@example.com"
    password = "secretpassword"
    user_in = UserCreate(email=email, nombre="Auth", password=password)
    auth_service.register_user(db, user_in=user_in)
    user = auth_service.authenticate_user(db, email=email, password=password)
    assert user.email == email

def test_authenticate_user_wrong_password_raises(db):
    email = "wrong@example.com"
    password = "correct"
    user_in = UserCreate(email=email, nombre="Wrong", password=password)
    auth_service.register_user(db, user_in=user_in)
    with pytest.raises(HTTPException) as exc:
        auth_service.authenticate_user(db, email=email, password="incorrect")
    assert exc.value.status_code == 401

def test_reset_password_expired_token_raises(db):
    email = "expired@example.com"
    user_in = UserCreate(email=email, nombre="Expired", password="password123")
    user = auth_service.register_user(db, user_in=user_in)
    
    # Manually set expired token
    user.reset_token = "expired-token"
    user.reset_token_expires = datetime.now(timezone.utc) - timedelta(minutes=1)
    db.add(user)
    db.commit()
    
    with pytest.raises(HTTPException) as exc:
        auth_service.reset_password(db, token="expired-token", new_password="newpassword123")
    assert exc.value.status_code == 400
    assert "expirado" in exc.value.detail
