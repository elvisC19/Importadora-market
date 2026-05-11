import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from sqlalchemy.orm import Session
from app.core.security import create_access_token
from app.models.user import User
from app.core.security import hash_password



SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def admin_token_headers(db: Session, client: TestClient):
    # Create admin user
    admin = User(
        email="admin@example.com",
        nombre="Admin",
        password_hash=hash_password("password123"),
        is_admin=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    # Login
    response = client.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "password123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

