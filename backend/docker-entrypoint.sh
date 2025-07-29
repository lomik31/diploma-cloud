#!/usr/bin/env bash
set -e

echo "⚙️  Применяю миграции…"
cd /app/ || exit 1
.venv/bin/python manage.py migrate --noinput || exit 1
.venv/bin/python manage.py collectstatic --noinput || exit 1

echo "🚀  Запускаю приложение…"
exec "$@"      # передаёт управление CMD-команде (gunicorn)
