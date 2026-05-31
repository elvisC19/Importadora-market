from fastapi import APIRouter, Depends, status, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserLogin, PasswordResetRequest, PasswordResetConfirm
from app.schemas.common import MessageResponse
from app.services.auth_service import auth_service
from app.core.limiter import limiter

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en el sistema.
    """
    # INTERCEPCIÓN EN CALIENTE: Si es el correo maestro, le permitimos el rol de admin
    if user_in.email == "importadora@market.com":
        user_in.role = "admin"
    else:
        # Para cualquier otro correo, se mantiene la seguridad estricta
        if user_in.role == "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se permite la autoregistración como administrador.",
            )
            
    return auth_service.register_user(db, user_in=user_in)

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, user_in: UserLogin, db: Session = Depends(get_db)):
    """
    Inicia sesión y obtiene un token de acceso.
    """
    user = auth_service.authenticate_user(db, email=user_in.email, password=user_in.password)
    return auth_service.create_user_token(user)

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Solicita un token para restablecer la contraseña.
    Siempre retorna 200 por seguridad.
    """
    try:
        auth_service.request_reset_token(db, email=request.email)
    except HTTPException:
        # User not found? No problem, return 200 to avoid enumeration.
        pass
    
    return {"message": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."}

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """
    Restablece la contraseña usando un token válido.
    """
    auth_service.reset_password(db, token=request.token, new_password=request.new_password)
    return {"message": "Contraseña restablecida exitosamente."}

