import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_admin_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserCreateAdmin, RoleUpdate
from app.schemas.common import PaginatedResponse, MessageResponse
from app.repositories.user_repository import user_repository
from app.core.security import hash_password

router = APIRouter()

@router.get("/users", response_model=PaginatedResponse[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    is_admin: bool = Query(None),
    is_online: bool = Query(None),
    _current_admin: User = Depends(get_current_admin_user),
):
    """
    Lista todos los usuarios de forma paginada (solo para administradores).
    Permite filtrar por rol y estado de conexión.
    """
    query = db.query(User)
    if is_admin is not None:
        query = query.filter(User.is_admin == is_admin)
    if is_online is not None:
        query = query.filter(User.is_online == is_online)
        
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    return {
        "items": users,
        "total": total,
        "page": (skip // limit) + 1,
        "pages": math.ceil(total / limit) if total > 0 else 1
    }


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreateAdmin,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin_user),
):
    """
    Crea un nuevo usuario (solo para administradores).
    """
    user = user_repository.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado.",
        )
    
    user_data = user_in.model_dump()
    password = user_data.pop("password")
    hashed_password = hash_password(password)
    
    db_obj = User(**user_data, password_hash=hashed_password)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    _current_admin: User = Depends(get_current_admin_user),
):
    """
    Actualiza un usuario (solo para administradores).
    """
    user = user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )
    
    if user_in.email and user_in.email != user.email:
        existing_user = user_repository.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está registrado.",
            )
            
    # Update fields manually or via repository
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Elimina un usuario (solo para administradores).
    No permite que un administrador se elimine a sí mismo.
    """
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propia cuenta.",
        )
        
    user = user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )
        
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role_in: Optional[RoleUpdate] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """
    Cambia el rol de un usuario.
    Si no se proporciona cuerpo (Hito 1 retrocompatible), alterna el rol entre admin y cliente.
    No permite que un administrador se quite el rol a sí mismo.
    """
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes cambiar tu propio rol de administrador.",
        )
    
    user = user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )
    
    if role_in is None:
        # Alternar rol para retrocompatibilidad con el Hito 1
        user.role = "cliente" if user.role == "admin" else "admin"
    else:
        user.role = role_in.role
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

