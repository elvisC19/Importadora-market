def test_register_user_success(client):
    payload = {
        "email": "api_success@example.com",
        "nombre": "API User",
        "password": "password123",
        "telefono": "71234567"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["nombre"] == payload["nombre"]
    assert "id" in data

def test_register_duplicate_email_raises_400(client):
    payload = {
        "email": "api_dup@example.com",
        "nombre": "API User",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=payload)
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "registrado" in response.json()["detail"]

def test_register_invalid_email_raises_422(client):
    payload = {
        "email": "not-an-email",
        "nombre": "API User",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422

def test_login_success(client):
    register_payload = {
        "email": "login_test@example.com",
        "nombre": "Login User",
        "password": "correct_password"
    }
    client.post("/api/v1/auth/register", json=register_payload)
    
    login_payload = {
        "email": "login_test@example.com",
        "password": "correct_password"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password_raises_401(client):
    register_payload = {
        "email": "wrong_login@example.com",
        "nombre": "Login User",
        "password": "correct_password"
    }
    client.post("/api/v1/auth/register", json=register_payload)
    
    login_payload = {
        "email": "wrong_login@example.com",
        "password": "wrong_password"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401

def test_forgot_password_always_returns_200(client):
    # Non-existent email
    payload = {"email": "nonexistent@example.com"}
    response = client.post("/api/v1/auth/forgot-password", json=payload)
    assert response.status_code == 200
    assert "correo" in response.json()["message"]

def test_reset_password_invalid_token_raises_400(client):
    payload = {
        "token": "invalid-token",
        "new_password": "newpassword123"
    }
    response = client.post("/api/v1/auth/reset-password", json=payload)
    assert response.status_code == 400

def test_read_user_me_no_token_raises_401(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401

def test_read_user_me_success(client):
    register_payload = {
        "email": "me_test@example.com",
        "nombre": "Me User",
        "password": "correct_password"
    }
    client.post("/api/v1/auth/register", json=register_payload)
    
    login_payload = {
        "email": "me_test@example.com",
        "password": "correct_password"
    }
    login_response = client.post("/api/v1/auth/login", json=login_payload)
    token = login_response.json()["access_token"]
    
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == register_payload["email"]

def test_read_user_me_admin_success(client, db):
    # Register a user and manually make it admin
    from app.services.auth_service import auth_service
    from app.schemas.user import UserCreate
    
    user_in = UserCreate(email="admin_test@example.com", nombre="Admin", password="admin_password")
    user = auth_service.register_user(db, user_in=user_in)
    user.is_admin = True
    db.add(user)
    db.commit()

    
    login_payload = {
        "email": "admin_test@example.com",
        "password": "admin_password"
    }
    login_response = client.post("/api/v1/auth/login", json=login_payload)
    token = login_response.json()["access_token"]
    
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["is_admin"] is True


