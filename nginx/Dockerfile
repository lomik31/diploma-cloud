FROM nginx:alpine

RUN apk add --no-cache openssl

ENV CERT_DIR=/etc/nginx/certs

WORKDIR /etc/nginx/
COPY ../certs/ ${CERT_DIR}/
COPY nginx.conf .

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "nginx", "-g", "daemon off;" ]
