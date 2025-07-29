#!/bin/sh
set -eu

CERT_DIR="${CERT_DIR:-/etc/nginx/certs}"
CERT="${CERT_DIR}/fullchain.crt"
KEY="${CERT_DIR}/private.key"
DAYS="${DAYS_VALID:-30}"

# Создаём каталог, если он ещё не существует
mkdir -p "$CERT_DIR"


if [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
CN=${DOMAINS%%,*}
SAN="subjectAltName=DNS:$(echo "$DOMAINS" | sed 's/,/,DNS:/g')"

   echo "⚠️  Сертификаты не найдены — генерирую самоподписанные…"
   openssl req -x509 -nodes -days "$DAYS" -newkey rsa:4096 \
      -keyout "$KEY" -out "$CERT" \
      -subj "/CN=${CN}" \
      -addext "${SAN}"
   echo "✅  Готово: $CERT + $KEY"
else
   echo "🔑  Найдены существующие сертификаты — пропускаю генерацию."
fi

DOMAINS_SPACED="${DOMAINS//,/ }"
sed -i "s/\\\$DOMAIN\\\$/${DOMAINS_SPACED}/g" /etc/nginx/nginx.conf

exec "$@"
