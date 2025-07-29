#!/usr/bin/env bash
set -e

echo "⚙️  Применяю миграции…"
cd /app/src || exit 1
uv run manage.py migrate --noinput || exit 1
uv run manage.py collectstatic --noinput || exit 1

echo "🚀  Запускаю приложение…"
exec "$@"      # передаёт управление CMD-команде (gunicorn)
