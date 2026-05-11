import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user_repository import user_repository
from app.models.user import User
from app.schemas.user import UserCreate

class AuthService:
    def register_user(self, db: Session, *, user_in: UserCreate) -> User:
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

    def authenticate_user(self, db: Session, *, email: str, password: str) -> User:
        user = user_repository.get_by_email(db, email=email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    def create_user_token(self, user: User) -> dict:
        return {
            "access_token": create_access_token(data={"sub": str(user.id), "email": user.email}),
            "token_type": "bearer",
        }

    def request_reset_token(self, db: Session, *, email: str) -> str:
        user = user_repository.get_by_email(db, email=email)
        if not user:
            # We return a dummy token or message to avoid user enumeration?
            # For this task, we assume the user wants the token back for testing/logic.
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )
        
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=30)
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return token

    def reset_password(self, db: Session, *, token: str, new_password: str) -> bool:
        user = user_repository.get_by_reset_token(db, token=token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token de recuperación inválido",
            )
        
        # Check expiry
        if user.reset_token_expires.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token de recuperación expirado",
            )
        
        user.password_hash = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        
        db.add(user)
        db.commit()
        return True

auth_service = AuthService()
