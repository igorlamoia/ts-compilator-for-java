#!/bin/sh
set -e

echo "▶ Running database migrations..."
uv run alembic upgrade head

echo "▶ Running database seed..."
uv run python scripts/seed.py

echo "▶ Starting application..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
