import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.contact_message import ContactMessage


def test_create_contact_message(client: TestClient, db: Session):
    data = {
        "name": "Juan Perez",
        "email": "juan@example.com",
        "message": "Hola, quisiera saber si tienen stock del producto X."
    }
    response = client.post("/api/v1/contact", json=data)
    assert response.status_code == 201
    content = response.json()
    assert content["name"] == data["name"]
    assert content["email"] == data["email"]
    assert content["message"] == data["message"]
    assert content["is_read"] is False
    assert "id" in content
    assert "sent_at" in content

    # Verify in DB
    db_msg = db.query(ContactMessage).filter(ContactMessage.id == content["id"]).first()
    assert db_msg is not None
    assert db_msg.name == data["name"]


def test_create_contact_validation_error(client: TestClient):
    # Invalid email and too short message
    data = {
        "name": "J",
        "email": "invalid-email",
        "message": "Hi"
    }
    response = client.post("/api/v1/contact", json=data)
    assert response.status_code == 422


def test_get_contacts_admin(client: TestClient, admin_token_headers: dict, db: Session):
    # Add a contact message
    msg = ContactMessage(name="Maria Lopez", email="maria@example.com", message="Consulta sobre envios nacionales.")
    db.add(msg)
    db.commit()
    db.refresh(msg)

    response = client.get("/api/v1/admin/contacts", headers=admin_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert "items" in content
    assert "total" in content
    assert content["total"] >= 1
    assert any(item["id"] == msg.id for item in content["items"])


def test_get_contacts_unauthorized(client: TestClient):
    response = client.get("/api/v1/admin/contacts")
    assert response.status_code == 401


def test_mark_contact_as_read(client: TestClient, admin_token_headers: dict, db: Session):
    # Add an unread contact message
    msg = ContactMessage(name="Carlos Gomez", email="carlos@example.com", message="Consulta sobre facturacion.", is_read=False)
    db.add(msg)
    db.commit()
    db.refresh(msg)

    response = client.put(f"/api/v1/admin/contacts/{msg.id}/read", headers=admin_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == msg.id
    assert content["is_read"] is True

    # Verify in DB
    db.refresh(msg)
    assert msg.is_read is True


def test_mark_contact_as_read_not_found(client: TestClient, admin_token_headers: dict):
    response = client.put("/api/v1/admin/contacts/99999/read", headers=admin_token_headers)
    assert response.status_code == 404
