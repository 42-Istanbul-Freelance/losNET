#!/bin/bash

set -e

DOMAIN_OR_IP="${1:-localhost}"

mkdir -p ./ssl ./certbot/www

if [ -f "./ssl/fullchain.pem" ] && [ -f "./ssl/privkey.pem" ]; then
  echo "✅ SSL sertifikaları zaten mevcut: ./ssl"
  exit 0
fi

echo "🔐 Self-signed SSL sertifikası üretiliyor (${DOMAIN_OR_IP})..."

if [[ "$DOMAIN_OR_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  SAN="IP:${DOMAIN_OR_IP},IP:127.0.0.1"
else
  SAN="DNS:${DOMAIN_OR_IP},DNS:localhost,IP:127.0.0.1"
fi

openssl req -x509 -nodes -newkey rsa:2048 -sha256 -days 365 \
  -keyout ./ssl/privkey.pem \
  -out ./ssl/fullchain.pem \
  -subj "/CN=${DOMAIN_OR_IP}" \
  -addext "subjectAltName=${SAN}"

echo "✅ SSL hazır. HTTPS aktif olacak (self-signed)."
echo "ℹ️  Production'da trusted sertifika için Let's Encrypt önerilir."
