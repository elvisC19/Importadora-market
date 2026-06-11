import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User

from app.api.v1.router import api_router
from sqlalchemy import text

logger = logging.getLogger("app.main")

def init_db_columns():
    db = SessionLocal()
    try:
        # Intenta verificar si la columna existe de forma segura
        db.execute(text("SELECT is_active FROM products LIMIT 1;"))
    except Exception:
        db.rollback()
        try:
            logger.info("La columna 'is_active' no existe en la base de datos. Creándola de emergencia...")
            # Inyecta la columna físicamente con valor true por defecto
            db.execute(text("ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;"))
            db.commit()
            logger.info("Columna 'is_active' creada con éxito en la base de datos.")
        except Exception as e:
            db.rollback()
            logger.error(f"Error al crear la columna: {e}")
    finally:
        db.close()

# Ejecuta la función de inicialización de emergencia
init_db_columns()

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
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

app = FastAPI(
    title="Importadora Market API",
    description="API REST para la plataforma web de Importadora Market (Bolivia)",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Router ────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")

# ── CORS ──────────────────────────────────────────────────
# Permitir tanto el origen configurado como los locales típicos para desarrollo
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:4173",
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
