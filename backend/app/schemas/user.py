"""Esquemas Pydantic para usuarios."""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


# ── Helpers ───────────────────────────────────────────────
_BOLIVIAN_PHONE_RE = re.compile(r"^[67]\d{7}$")


# ── Request schemas ───────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    nombre: str
    password: str
    telefono: Optional[str] = None

    @field_validator("nombre")
    @classmethod
    def nombre_min_length(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres")
        return v

    @field_validator("telefono")
    @classmethod
    def telefono_boliviano(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not _BOLIVIAN_PHONE_RE.match(v):
            raise ValueError(
                "El teléfono debe ser boliviano: 8 dígitos comenzando con 6 o 7"
            )
        return v


class UserCreateAdmin(UserCreate):
    is_admin: bool = False



class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None

    @field_validator("nombre")
    @classmethod
    def nombre_min_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v.strip()) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return v.strip() if v else v

    @field_validator("telefono")
    @classmethod
    def telefono_boliviano(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not _BOLIVIAN_PHONE_RE.match(v):
            raise ValueError(
                "El teléfono debe ser boliviano: 8 dígitos comenzando con 6 o 7"
            )
        return v


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres")
        return v


# ── Response schemas ──────────────────────────────────────
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    nombre: str
    telefono: Optional[str] = None
    is_admin: bool
    created_at: datetime
