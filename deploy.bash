#!/bin/bash

# Configuration
PROJECT_NAME="losev-net"
# Modern 'docker compose' tercih edilir, yoksa 'docker-compose' kullanılır
DOCKER_COMPOSE="docker compose"
if ! $DOCKER_COMPOSE version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting deployment for $PROJECT_NAME...${NC}"

# 1. Environment & Folder Setup
echo -e "${BLUE}🔧 Checking environment and folders...${NC}"

# Veri klasörlerini oluştur (Docker bazen root yetkisiyle oluşturup sorun çıkarabiliyor)
mkdir -p docker_data/mongodb
mkdir -p server/uploads

# .env dosyalarını kontrol et
[ ! -f "client/.env" ] && cp client/.env.example client/.env && echo -e "⚠️ Created client/.env"
[ ! -f "server/.env" ] && cp server/.env.example server/.env && \
    sed -i 's/localhost:27017/mongodb:27017/g' server/.env && echo -e "⚠️ Created server/.env"

# 2. Build and start services
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
$DOCKER_COMPOSE down

echo -e "${BLUE}🏗️  Building and starting containers...${NC}"
$DOCKER_COMPOSE up --build -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "----------------------------------------"
    echo -e "🌐 Web Interface: ${BLUE}http://localhost:8080${NC}"
    echo -e "🔌 API Gateway:   ${BLUE}http://localhost:5000${NC}"
    echo -e "----------------------------------------"
    echo -e "💡 Verilerin yüklenmesi (seed) yaklaşık 5-10 saniye sürer."
    echo -e "💡 Logları izlemek için: ${BLUE}$DOCKER_COMPOSE logs -f api${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi
