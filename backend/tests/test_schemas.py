"""Tests para app.schemas.user."""

import pytest
from pydantic import ValidationError

from app.schemas.user import UserCreate


def test_invalid_email_raises():
    with pytest.raises(ValidationError):
        UserCreate(email="no-es-email", nombre="Juan", password="123456")


def test_short_password_raises():
    with pytest.raises(ValidationError):
        UserCreate(email="a@b.com", nombre="Juan", password="123")


def test_invalid_phone_raises():
    with pytest.raises(ValidationError):
        UserCreate(
            email="a@b.com", nombre="Juan", password="123456", telefono="12345678"
        )


def test_valid_bolivian_phone():
    user = UserCreate(
        email="a@b.com", nombre="Juan", password="123456", telefono="71234567"
    )
    assert user.telefono == "71234567"


def test_phone_starting_with_6():
    user = UserCreate(
        email="a@b.com", nombre="Juan", password="123456", telefono="61234567"
    )
    assert user.telefono == "61234567"


def test_phone_too_short_raises():
    with pytest.raises(ValidationError):
        UserCreate(
            email="a@b.com", nombre="Juan", password="123456", telefono="7123456"
        )
