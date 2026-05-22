"""
Punto de entrada de la aplicación FastAPI.
Importadora Market API — Fase I (MVP).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.api.v1.router import api_router

# ── Aplicación ────────────────────────────────────────────
app = FastAPI(
    title="Importadora Market API",
    description="API REST para la plataforma web de Importadora Market (Bolivia)",
    version="0.1.0",
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
