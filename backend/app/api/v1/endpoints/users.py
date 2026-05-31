from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.v1.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, MyPasswordChange
from app.schemas.common import MessageResponse
from app.repositories.user_repository import user_repository
from app.core.security import verify_password, hash_password

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    """
    Obtiene el perfil del usuario autenticado actualmente.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Actualiza el perfil del usuario autenticado actualmente.
    """
    if user_in.email and user_in.email != current_user.email:
        user = user_repository.get_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está en uso por otro usuario.",
            )
    
    return user_repository.update(db, db_obj=current_user, obj_in=user_in)


@router.patch("/me/password", response_model=MessageResponse)
def change_my_password(
    password_data: MyPasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permite que un usuario cambie su propia contraseña verificando la actual.
    """
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual no es correcta.",
        )
    
    current_user.password_hash = hash_password(password_data.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Contraseña actualizada exitosamente"}


