"""
Configuración central del proyecto.

Lee todas las variables de entorno desde el archivo .env usando
pydantic BaseSettings.  Cambiar DATABASE_URL a una cadena
postgresql://… no requiere ningún otro cambio en el código.
"""

from pathlib import Path
from pydantic_settings import BaseSettings

# Ruta al directorio raíz del backend (donde vive .env)
_BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Variables de entorno requeridas por la aplicación."""

    # ── Database ──────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./market.db"

    # ── JWT / Auth ────────────────────────────────────────
    SECRET_KEY: str = "change-this-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # ── SMTP (email) ──────────────────────────────────────
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # ── Admin ─────────────────────────────────────────────
    ADMIN_EMAIL: str = ""

    # ── Frontend ──────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = str(_BASE_DIR / ".env")
        env_file_encoding = "utf-8"


# Instancia singleton para importar en toda la app
settings = Settings()
