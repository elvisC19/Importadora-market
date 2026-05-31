"""Servicio para la gestión de mensajes de contacto y notificaciones — Hito 5."""

from sqlalchemy.orm import Session
from app.repositories.contact_repository import contact_repository
from app.schemas.contact import ContactCreate
from app.models.contact_message import ContactMessage
from app.services.email_service import email_service


class ContactService:
    def create_contact_message(self, db: Session, *, obj_in: ContactCreate) -> ContactMessage:
        """
        Guarda el mensaje de contacto en la base de datos y envía una notificación
        por correo electrónico al administrador.
        """
        # Guardar en BD
        db_obj = contact_repository.create(db, obj_in=obj_in)
        
        # Notificar por correo
        try:
            email_service.send_contact_notification(db_obj)
        except Exception:
            # En caso de error inesperado, permitir que la solicitud continúe
            pass
            
        return db_obj


contact_service = ContactService()
