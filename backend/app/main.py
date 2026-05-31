"""
Punto de entrada de la aplicación FastAPI.
Importadora Market API — Fase I (MVP).
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User

from app.api.v1.router import api_router

logger = logging.getLogger("app.main")

ADMIN_EMAIL = "importadora@market.com"


# ── Lifespan: enforce admin role on startup ───────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Garantiza que la cuenta core (importadora@market.com) tenga
    rol 'admin' en cuanto exista en la base de datos.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if user:
            if user.role != "admin":
                user.role = "admin"
                db.commit()
                logger.info("Lifespan: ¡Rol de '%s' actualizado con éxito a 'admin'!", ADMIN_EMAIL)
            else:
                logger.info("Lifespan: '%s' ya es administrador.", ADMIN_EMAIL)
        else:
            logger.info("Lifespan: Esperando a que el usuario '%s' se registre en la app.", ADMIN_EMAIL)
            
    except Exception as exc:
        db.rollback()
        logger.error("Lifespan: error al gestionar el usuario admin — %s", exc)
    finally:
        db.close()

    yield  # El servidor web se ejecuta aquí


# ── Aplicación ────────────────────────────────────────────
app = FastAPI(
    title="Importadora Market API",
    description="API REST para la plataforma web de Importadora Market (Bolivia)",
    version="0.1.0",
    lifespan=lifespan,
)

# ── Router ────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")

# ── CORS ──────────────────────────────────────────────────
# Permitir tanto el origen configurado como los locales típicos para desarrollo
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
# Eliminar posibles duplicados
origins = sorted(list(set(origins)))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Endpoint raíz ────────────────────────────────────────
@app.get("/")
def root():
    """Health-check básico."""
    return {
        "status": "ok",
        "message": "Importadora Market API",
    }
