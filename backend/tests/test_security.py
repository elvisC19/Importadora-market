"""Tests para app.core.security."""

from datetime import timedelta

import pytest
from fastapi import HTTPException

from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


# ── Hashing ───────────────────────────────────────────────
def test_hash_and_verify():
    plain = "Contraseña123!"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed) is True


def test_verify_wrong_password():
    hashed = hash_password("correcta")
    assert verify_password("incorrecta", hashed) is False


# ── JWT ───────────────────────────────────────────────────
def test_create_and_decode_token():
    payload = {"sub": "user@example.com", "role": "admin"}
    token = create_access_token(payload)
    decoded = decode_token(token)
    assert decoded["sub"] == "user@example.com"
    assert decoded["role"] == "admin"
    assert "exp" in decoded


def test_expired_token_raises_401():
    token = create_access_token(
        {"sub": "user@example.com"},
        expires_delta=timedelta(seconds=-1),
    )
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token)
    assert exc_info.value.status_code == 401


def test_invalid_token_raises_401():
    with pytest.raises(HTTPException) as exc_info:
        decode_token("esto.no.es.un.token.valido")
    assert exc_info.value.status_code == 401
