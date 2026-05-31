"""Esquemas Pydantic para los mensajes de contacto — Hito 5."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nombre completo del remitente")
    email: EmailStr = Field(..., description="Correo electrónico de contacto")
    message: str = Field(..., min_length=5, description="Contenido de la consulta o mensaje")


class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    message: str
    sent_at: datetime
    is_read: bool
