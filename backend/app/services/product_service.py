from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.category import Category
from app.models.user import User
from app.repositories.product_repository import product_repository
from app.repositories.category_repository import category_repository
from app.schemas.product import ProductCreate, ProductUpdate, ProductFilter


class ProductService:
    def get_products(self, db: Session, filters: ProductFilter, is_admin: bool = False) -> List[Product]:
        if not is_admin:
            filters.is_approved = True
        return product_repository.get_all_filtered(db, filters=filters)

    def get_product_detail(self, db: Session, product_id: int, is_admin: bool = False) -> Product:
        product = product_repository.get(db, id=product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        
        if not is_admin and not product.is_approved:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
            
        # Incrementar vistas
        product_repository.increment_views(db, product_id=product.id)
        
        return product

    def create_product(
        self,
        db: Session,
        product_in: ProductCreate,
        current_user: User = None,
        user_id: int = None
    ) -> Product:
        if product_in.is_featured:
            if product_repository.count_featured(db) >= 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Límite máximo de 10 productos destacados alcanzado."
                )
        
        product_data = product_in.model_dump()
        product_data["is_approved"] = False
        
        final_user_id = None
        if isinstance(current_user, User):
            final_user_id = current_user.id
        elif isinstance(current_user, int):
            final_user_id = current_user
        elif user_id is not None:
            final_user_id = user_id
            
        product_data["submitted_by_id"] = final_user_id
        
        db_obj = Product(**product_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_my_products(self, db: Session, user_id: int) -> List[Product]:
        return db.query(Product).filter(Product.submitted_by_id == user_id).all()

    def update_product(self, db: Session, product_id: int, product_in: ProductUpdate, user_id: int) -> Product:
        product = product_repository.get(db, id=product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
            
        if product_in.is_featured is True and not product.is_featured:
            if product_repository.count_featured(db) >= 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Límite máximo de 10 productos destacados alcanzado."
                )
                
        updated_product = product_repository.update(db, db_obj=product, obj_in=product_in)
        return updated_product

    def approve_product(self, db: Session, product_id: int, admin_id: int) -> Product:
        product = product_repository.get(db, id=product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
            
        product.is_approved = True
        product.approved_by_id = admin_id
        product.approved_at = datetime.now(timezone.utc)
        
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def toggle_approval(self, db: Session, product_id: int, admin_id: int) -> Product:
        product = product_repository.get(db, id=product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
            
        product.is_approved = not product.is_approved
        if product.is_approved:
            product.approved_by_id = admin_id
            product.approved_at = datetime.now(timezone.utc)
        else:
            product.approved_by_id = None
            product.approved_at = None
            
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def delete_product(self, db: Session, product_id: int) -> Product:
        product = product_repository.get(db, id=product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        return product_repository.delete(db, id=product_id)

    def toggle_featured(self, db: Session, product_id: int) -> Product:
        product = product_repository.get(db, id=product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
            
        if not product.is_featured:
            if product_repository.count_featured(db) >= 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Límite máximo de 10 productos destacados alcanzado."
                )
            product.is_featured = True
        else:
            product.is_featured = False
            
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def get_categories(self, db: Session) -> List[Category]:
        return category_repository.get_all(db)


product_service = ProductService()
