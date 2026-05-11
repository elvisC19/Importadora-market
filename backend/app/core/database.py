"""
Conexión a la base de datos con SQLAlchemy.

• Detecta automáticamente si DATABASE_URL apunta a SQLite y, de ser así,
  agrega `check_same_thread=False` en los connect_args.
• Para PostgreSQL (producción) basta con cambiar DATABASE_URL en .env;
  no se requiere ningún cambio de código.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# ── Detección SQLite ──────────────────────────────────────
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

_connect_args: dict = {}
if _is_sqlite:
    _connect_args["check_same_thread"] = False

# ── Engine, Session, Base ─────────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
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
