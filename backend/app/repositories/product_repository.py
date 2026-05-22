"""Repositorio de base de datos para Productos."""

from typing import List, Optional
from sqlalchemy import case
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductFilter


class ProductRepository(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def _apply_filters(self, db: Session, filters: ProductFilter):
        """Aplicar filtros comunes a la consulta de productos."""
        query = db.query(Product)

        if filters.nombre:
            query = query.filter(Product.nombre.ilike(f"%{filters.nombre}%"))

        if filters.categoria_id is not None:
            query = query.filter(Product.categoria_id == filters.categoria_id)

        if filters.is_approved is not None:
            query = query.filter(Product.is_approved == filters.is_approved)

        if filters.is_offer is not None:
            query = query.filter(Product.is_offer == filters.is_offer)

        if filters.is_new is not None:
            query = query.filter(Product.is_new == filters.is_new)

        if filters.is_featured is not None:
            query = query.filter(Product.is_featured == filters.is_featured)

        if filters.precio_min is not None or filters.precio_max is not None:
            active_price = case(
                (Product.is_offer & (Product.offer_price != None), Product.offer_price),
                else_=Product.precio
            )
            if filters.precio_min is not None:
                query = query.filter(active_price >= filters.precio_min)
            if filters.precio_max is not None:
                query = query.filter(active_price <= filters.precio_max)

        return query

    def get_all_filtered(self, db: Session, filters: ProductFilter) -> List[Product]:
        """Obtener productos filtrados y paginados."""
        return self._apply_filters(db, filters).offset(filters.skip).limit(filters.limit).all()

    def count_filtered(self, db: Session, filters: ProductFilter) -> int:
        """Contar productos según los filtros aplicados."""
        return self._apply_filters(db, filters).count()

    def get_offers(self, db: Session, *, skip: int = 0, limit: int = 20) -> List[Product]:
        """Obtener ofertas aprobadas."""
        return (
            db.query(Product)
            .filter(Product.is_approved == True, Product.is_offer == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_new_arrivals(self, db: Session, *, skip: int = 0, limit: int = 20) -> List[Product]:
        """Obtener novedades aprobadas ordenadas por fecha de creación descendente."""
        return (
            db.query(Product)
            .filter(Product.is_approved == True, Product.is_new == True)
            .order_by(Product.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_featured(self, db: Session, *, skip: int = 0, limit: int = 20) -> List[Product]:
        """Obtener destacados aprobados."""
        return (
            db.query(Product)
            .filter(Product.is_approved == True, Product.is_featured == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_featured(self, db: Session) -> int:
        """Contar el número total de productos marcados como destacados en la base de datos (tanto aprobados como pendientes)."""
        return db.query(Product).filter(Product.is_featured == True).count()

    def increment_views(self, db: Session, product_id: int) -> Optional[Product]:
        """Incrementar en 1 el número de vistas actuales de un producto."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.vistas_actuales += 1
            db.add(product)
            db.commit()
            db.refresh(product)
        return product

    def update_stock(self, db: Session, product_id: int, quantity: int) -> Optional[Product]:
        """Actualizar el stock disponible de un producto."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            product.stock = quantity
            db.add(product)
            db.commit()
            db.refresh(product)
        return product


product_repository = ProductRepository(Product)
