import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password

def test_create_user_admin(client: TestClient, admin_token_headers: dict):
    data = {
        "email": "newuser@example.com",
        "nombre": "New User",
        "password": "password123",
        "telefono": "71234567",
        "is_admin": True
    }
    response = client.post("/api/v1/admin/users", json=data, headers=admin_token_headers)
    assert response.status_code == 201
    content = response.json()
    assert content["email"] == data["email"]
    assert content["is_admin"] is True

def test_update_user_admin(client: TestClient, admin_token_headers: dict, db: Session):
    # Create a user to update
    user = User(email="toupdate@example.com", nombre="To Update", password_hash=hash_password("password123"), is_admin=False)
    db.add(user)
    db.commit()
    db.refresh(user)

    data = {"nombre": "Updated Name", "email": "updated@example.com"}
    response = client.put(f"/api/v1/admin/users/{user.id}", json=data, headers=admin_token_headers)
    assert response.status_code == 200
    assert response.json()["nombre"] == "Updated Name"
    assert response.json()["email"] == "updated@example.com"

def test_update_user_duplicate_email(client: TestClient, admin_token_headers: dict, db: Session):
    # Create two users
    user1 = User(email="user1@example.com", nombre="User 1", password_hash=hash_password("password123"))
    user2 = User(email="user2@example.com", nombre="User 2", password_hash=hash_password("password123"))
    db.add(user1)
    db.add(user2)
    db.commit()

    data = {"email": "user2@example.com"}
    response = client.put(f"/api/v1/admin/users/{user1.id}", json=data, headers=admin_token_headers)
    assert response.status_code == 400
    assert "registrado" in response.json()["detail"]

def test_delete_user_admin(client: TestClient, admin_token_headers: dict, db: Session):
    user = User(email="todelete@example.com", nombre="To Delete", password_hash=hash_password("password123"))
    db.add(user)
    db.commit()
    db.refresh(user)

    response = client.delete(f"/api/v1/admin/users/{user.id}", headers=admin_token_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Usuario eliminado correctamente"
    
    # Verify it's gone
    assert db.query(User).filter(User.id == user.id).first() is None

def test_delete_self_admin(client: TestClient, admin_token_headers: dict, db: Session):
    # Find the admin user (the one used for the token)
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    assert admin is not None

    response = client.delete(f"/api/v1/admin/users/{admin.id}", headers=admin_token_headers)
    assert response.status_code == 400
    assert "propia cuenta" in response.json()["detail"]
