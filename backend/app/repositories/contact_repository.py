"""Repositorio de base de datos para mensajes de contacto — Hito 5."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.contact_message import ContactMessage
from app.schemas.contact import ContactCreate


class ContactRepository(CRUDBase[ContactMessage, ContactCreate, ContactCreate]):
    def create(self, db: Session, *, obj_in: ContactCreate) -> ContactMessage:
        """Crea y guarda un nuevo mensaje de contacto."""
        return super().create(db, obj_in=obj_in)

    def get_all(self, db: Session, *, skip: int = 0, limit: int = 20) -> List[ContactMessage]:
        """Obtiene una lista de mensajes ordenados de forma descendente por fecha de envío."""
        return db.query(ContactMessage).order_by(ContactMessage.sent_at.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, db: Session, id: int) -> Optional[ContactMessage]:
        """Obtiene un mensaje de contacto por su ID."""
        return db.query(ContactMessage).filter(ContactMessage.id == id).first()

    def mark_as_read(self, db: Session, db_obj: ContactMessage) -> ContactMessage:
        """Marca un mensaje de contacto como leído."""
        db_obj.is_read = True
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def count(self, db: Session) -> int:
        """Retorna el número total de mensajes."""
        return db.query(ContactMessage).count()


contact_repository = ContactRepository(ContactMessage)
