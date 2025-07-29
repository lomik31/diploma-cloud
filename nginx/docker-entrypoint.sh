#!/bin/sh
set -eu

CERT_DIR="${CERT_DIR:-/etc/nginx/certs}"
CERT="${CERT_DIR}/fullchain.crt"
KEY="${CERT_DIR}/private.key"
DAYS="${DAYS_VALID:-30}"
SUBJ="/CN=${DOMAIN}"

# Создаём каталог, если он ещё не существует
mkdir -p "$CERT_DIR"

# Проверяем, есть ли пара файлов
if [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
  echo "⚠️  Сертификаты не найдены — генерирую самоподписанные…"
  openssl req -x509 -nodes -days "$DAYS" -newkey rsa:4096 \
         -keyout "$KEY" -out "$CERT" -subj "$SUBJ"
  echo "✅  Готово: $CERT + $KEY"
else
  echo "🔑  Найдены существующие сертификаты — пропускаю генерацию."
fi


sed -i "s/\\\$DOMAIN\\\$/${DOMAIN}/g" /etc/nginx/nginx.conf

exec "$@"
