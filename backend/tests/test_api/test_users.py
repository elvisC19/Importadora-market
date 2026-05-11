import pytest
from app.services.auth_service import auth_service
from app.schemas.user import UserCreate

def get_token_for_user(client, email, password):
    login_payload = {"email": email, "password": password}
    response = client.post("/api/v1/auth/login", json=login_payload)
    if response.status_code != 200:
        raise Exception(f"Login failed: {response.json()}")
    return response.json()["access_token"]

def test_update_user_me_success(client):
    register_payload = {
        "email": "update_me@example.com",
        "nombre": "Original Name",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=register_payload)
    token = get_token_for_user(client, "update_me@example.com", "password123")
    
    update_payload = {"nombre": "Updated Name", "telefono": "71234567"}
    response = client.put(
        "/api/v1/users/me", 
        json=update_payload, 
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["nombre"] == "Updated Name"
    assert response.json()["telefono"] == "71234567"

def test_update_user_me_duplicate_email_raises_400(client):
    # Register user 1
    client.post("/api/v1/auth/register", json={"email": "u1@ex.com", "nombre": "U1", "password": "password123"})
    # Register user 2
    client.post("/api/v1/auth/register", json={"email": "u2@ex.com", "nombre": "U2", "password": "password123"})
    
    token1 = get_token_for_user(client, "u1@ex.com", "password123")
    
    # Try to change user 1's email to user 2's email
    response = client.put(
        "/api/v1/users/me", 
        json={"email": "u2@ex.com"}, 
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert response.status_code == 400
    assert "uso" in response.json()["detail"]

def test_admin_get_users_forbidden_for_regular_user(client):
    client.post("/api/v1/auth/register", json={"email": "reg@ex.com", "nombre": "Reg", "password": "password123"})
    token = get_token_for_user(client, "reg@ex.com", "password123")
    
    response = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403

def test_admin_get_users_success(client, db):
    # Create admin
    user_in = UserCreate(email="admin@ex.com", nombre="Admin", password="password123")
    user = auth_service.register_user(db, user_in=user_in)
    user.is_admin = True
    db.add(user)
    db.commit()
    
    token = get_token_for_user(client, "admin@ex.com", "password123")
    
    response = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1

def test_admin_toggle_role_success(client, db):
    # Create admin
    admin_in = UserCreate(email="admin2@ex.com", nombre="Admin", password="password123")
    admin_user = auth_service.register_user(db, user_in=admin_in)
    admin_user.is_admin = True
    db.add(admin_user)
    db.commit()
    
    # Create target user
    client.post("/api/v1/auth/register", json={"email": "target@ex.com", "nombre": "Target", "password": "password123"})
    # Get ID of the target user
    from app.repositories.user_repository import user_repository
    target_user = user_repository.get_by_email(db, email="target@ex.com")
    
    token = get_token_for_user(client, "admin2@ex.com", "password123")
    
    # Promote to admin
    response = client.patch(
        f"/api/v1/admin/users/{target_user.id}/role", 
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["is_admin"] is True
    
    # Demote to regular
    response = client.patch(
        f"/api/v1/admin/users/{target_user.id}/role", 
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["is_admin"] is False

def test_admin_cannot_demote_self(client, db):
    admin_in = UserCreate(email="admin3@ex.com", nombre="Admin", password="password123")
    admin_user = auth_service.register_user(db, user_in=admin_in)
    admin_user.is_admin = True
    db.add(admin_user)
    db.commit()
    
    token = get_token_for_user(client, "admin3@ex.com", "password123")
    
    response = client.patch(
        f"/api/v1/admin/users/{admin_user.id}/role", 
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 400
    assert "propio" in response.json()["detail"]
