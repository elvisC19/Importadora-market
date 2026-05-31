"""Endpoints para la recepción de mensajes de contacto públicos — Hito 5."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.contact import ContactCreate, ContactResponse
from app.services.contact_service import contact_service

router = APIRouter()


@router.post("/contact", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    *,
    db: Session = Depends(get_db),
    contact_in: ContactCreate
):
    """
    Recibe un nuevo mensaje de contacto de un visitante público,
    lo registra en la base de datos y envía una notificación por correo al administrador.
    """
    return contact_service.create_contact_message(db, obj_in=contact_in)
