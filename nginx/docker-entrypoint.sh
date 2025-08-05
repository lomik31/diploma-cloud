#!/bin/sh
set -eu

CERT_DIR="${CERT_DIR:-/etc/nginx/certs}"

KEY="${CERT_DIR}/private.key"
CERT_FULLCHAIN="${CERT_DIR}/fullchain.crt"

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_FULLCHAIN" ] || [ ! -f "$KEY" ]; then
   CN=${DOMAINS%%,*}
   SAN="subjectAltName=DNS:$(echo "$DOMAINS" | sed 's/,/,DNS:/g')"
   DAYS="${DAYS_VALID:-30}"

   CA_CERT="${CERT_DIR}/ca.crt"
   CA_KEY="${CERT_DIR}/ca.key"
   CA_SRL="${CERT_DIR}/ca.srl"
   CERT="${CERT_DIR}/domain.crt"
   CERT_CSR="${CERT_DIR}/domain.csr"

   echo "⚠️  Сертификаты не найдены — генерирую самоподписанные…"

   if [ -f "$CA_CERT" ] && [ -f "$CA_KEY" ]; then
      echo "🔑  Использую существующий CA сертификат и ключ."
   else
      echo "🔑  Генерирую новый CA сертификат и ключ."
      openssl req -x509 -nodes -days "$DAYS" -newkey rsa:4096 \
         -keyout "$CA_CERT" -out "$CA_KEY" \
         -subj "/CN=MyRootCA"
   fi

   openssl req -new -nodes -newkey rsa:4096 \
      -keyout "$KEY" -out "${CERT_CSR}" \
      -subj "/CN=${CN}" \
      -addext "${SAN}"
   openssl x509 -req -in "${CERT_CSR}" -CA "$CA_CERT" \
      -CAkey "$CA_KEY" -CAcreateserial \
      -out "$CERT" -days "$DAYS" -sha256 -extfile <(printf "$SAN") && \
      cat "$CERT" "$CA_CERT" > "$CERT_FULLCHAIN"

   rm "${CERT_CSR}" "${CERT}" "${CA_SRL}"

   echo "✅  Готово: $CERT + $KEY"
else
   echo "🔑  Найдены существующие сертификаты — пропускаю генерацию."
fi

DOMAINS_SPACED="${DOMAINS//,/ }"
sed -i "s/\\\$DOMAIN\\\$/${DOMAINS_SPACED}/g" /etc/nginx/nginx.conf

exec "$@"
