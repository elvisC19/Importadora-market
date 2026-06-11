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

    def get_only_with_active_products(self, db: Session) -> List[Category]:
        """Obtener solo las categorías que tienen al menos un producto activo, aprobado y con stock > 0."""
        from app.models.product import Product
        return (
            db.query(Category)
            .join(Category.products)
            .filter(
                Product.is_approved == True,
                Product.is_active == True,
                Product.stock > 0
            )
            .distinct()
            .all()
        )


category_repository = CategoryRepository(Category)

