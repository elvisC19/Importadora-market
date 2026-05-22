"""Repositorio de base de datos para Categorías."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.category import Category
from app.schemas.product import CategoryCreate


class CategoryRepository(CRUDBase[Category, CategoryCreate, CategoryCreate]):
    def get_by_nombre(self, db: Session, nombre: str) -> Optional[Category]:
        """Obtener una categoría por su nombre exacto."""
        return db.query(Category).filter(Category.nombre == nombre).first()

    def get_all(self, db: Session) -> List[Category]:
        """Obtener todas las categorías sin paginación."""
        return db.query(Category).all()


category_repository = CategoryRepository(Category)
