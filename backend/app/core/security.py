"""Utilidades de seguridad: hashing de contraseñas y JWT."""

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Hashing ───────────────────────────────────────────────
_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Devuelve el hash bcrypt de *plain*."""
    return _pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Compara *plain* contra *hashed*; devuelve True si coinciden."""
    return _pwd_ctx.verify(plain, hashed)


# ── JWT ───────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Crea un JWT firmado con los datos proporcionados."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Decodifica un JWT; lanza HTTP 401 si es inválido o expirado."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
