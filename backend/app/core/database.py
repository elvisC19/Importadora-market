"""
Conexión a la base de datos con SQLAlchemy.

• Detecta automáticamente si DATABASE_URL apunta a SQLite y, de ser así,
  agrega `check_same_thread=False` en los connect_args.
• Para PostgreSQL (producción) basta con cambiar DATABASE_URL en .env;
  no se requiere ningún cambio de código.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# Read DATABASE_URL environment variable, falling back to central settings
DATABASE_URL = os.getenv("DATABASE_URL", settings.DATABASE_URL)

# Implement Absolute Path Resolution for SQLite
if DATABASE_URL.startswith("sqlite:///"):
    db_file = DATABASE_URL.replace("sqlite:///", "")
    DATABASE_URL = f"sqlite:///{os.path.abspath(db_file)}"

# Synchronize the central settings so that migrations/env.py also uses this absolute URL
settings.DATABASE_URL = DATABASE_URL

# ── Detección SQLite ──────────────────────────────────────
_is_sqlite = DATABASE_URL.startswith("sqlite")

_connect_args: dict = {}
if _is_sqlite:
    _connect_args["check_same_thread"] = False

# ── Engine, Session, Base ─────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


# ── Dependencia FastAPI ───────────────────────────────────
def get_db():
    """Yield una sesión de BD por request; la cierra al finalizar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Resiliencia de Inicialización de SQLite ────────────────
import logging

logger = logging.getLogger("app.core.database")

if _is_sqlite:
    db_url = DATABASE_URL
    db_path = None
    if db_url.startswith("sqlite:///"):
        db_path = db_url[10:]
    elif db_url.startswith("sqlite://"):
        db_path = db_url[9:]

    if db_path and db_path != ":memory:" and not db_path.startswith("?"):
        if "?" in db_path:
            db_path = db_path.split("?")[0]
        
        # Obtener ruta absoluta para logs y validación de existencia
        abs_db_path = os.path.abspath(db_path)
        logger.info(f"Ruta de base de datos SQLite detectada: {abs_db_path}")
        
        if not os.path.exists(abs_db_path):
            logger.info("El archivo SQLite no existe. Inicializando tablas en caliente para resiliencia en Render...")
            try:
                # Asegurar que el directorio contenedor exista
                db_dir = os.path.dirname(abs_db_path)
                if db_dir and not os.path.exists(db_dir):
                    os.makedirs(db_dir, exist_ok=True)
                    logger.info(f"Directorio de base de datos creado: {db_dir}")
                
                # Importar modelos localmente para registrarlos en Base.metadata sin imports circulares
                import app.models  # noqa: F401
                
                # Crear tablas
                Base.metadata.create_all(bind=engine)
                logger.info(f"Base de datos SQLite y esquemas creados exitosamente en: {abs_db_path}")
            except Exception as e:
                logger.error(f"Error al inicializar la base de datos de forma resiliente: {e}")
        else:
            logger.info(f"El archivo SQLite ya existe en {abs_db_path}. No se requiere inicialización en caliente.")
