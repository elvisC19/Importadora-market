#!/usr/bin/env bash
# Script de entrada unificado para desplegar en Render

echo "=== INICIANDO DEPLOY EN RENDER ==="

# 1. Intentar aplicar migraciones con Alembic
echo "Ejecutando migraciones de base de datos..."
if alembic upgrade head; then
    echo "Migraciones de Alembic aplicadas exitosamente."
else
    echo "¡Las migraciones de Alembic fallaron!"
    echo "Aplicando fallback programático para crear tablas en caliente..."
    python -c "
import sys
import os
sys.path.append(os.path.abspath('.'))
try:
    from app.core.database import engine, Base
    import app.models
    print('Creando tablas programáticamente mediante SQLAlchemy...')
    Base.metadata.create_all(bind=engine)
    print('Tablas creadas exitosamente por el fallback.')
except Exception as e:
    print(f'Error crítico en el fallback programático: {e}')
    sys.exit(1)
"
fi

# 2. Sembrar datos del administrador
echo "Ejecutando sembrado de administrador..."
if python seed_admin.py; then
    echo "Usuario administrador sembrado / verificado con éxito."
else
    echo "Advertencia: Falló el sembrado de administrador."
fi

# 3. Sembrar datos de productos
echo "Ejecutando sembrado de productos..."
if python seeds/seed_products.py; then
    echo "Productos de prueba sembrados con éxito."
else
    echo "Advertencia: Falló el sembrado de productos."
fi

echo "=== CONFIGURACIÓN DE BASE DE DATOS COMPLETADA ==="

# 4. Levantar la aplicación de FastAPI
echo "Iniciando servidor de producción con Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}"
