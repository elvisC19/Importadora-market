#!/bin/bash
echo "Aplicando migraciones..."
python -m alembic upgrade head

echo "Verificando datos iniciales..."
python seeds/seed_products.py

echo "Iniciando servidor..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT

