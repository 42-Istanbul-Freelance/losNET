#!/bin/bash

# Configuration
IMAGE_NAME="losev-net-monolith"
CONTAINER_NAME="losev-monolith"
PORT=5000

# Local Data Directories
DATA_DIR="$(pwd)/docker_data"
MONGO_DATA="$DATA_DIR/mongodb"
UPLOAD_DATA="$(pwd)/server/uploads"

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Docker CLI ile başlatılıyor (Monolith)...${NC}"

# 1. Mevcut konteyneri temizle
if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
    echo -e "${BLUE}🧹 Eski konteyner durduruluyor ve siliniyor...${NC}"
    docker stop ${CONTAINER_NAME} > /dev/null
    docker rm ${CONTAINER_NAME} > /dev/null
fi

# 2. Yerel dizinleri hazırla
echo -e "${BLUE}📂 Dizinler kontrol ediliyor...${NC}"
mkdir -p "$MONGO_DATA"
mkdir -p "$UPLOAD_DATA"

# 3. İmajı inşa et
echo -e "${BLUE}🏗️  İmaj inşa ediliyor: $IMAGE_NAME...${NC}"
docker build -t ${IMAGE_NAME} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ İmaj inşası başarısız oldu!${NC}"
    exit 1
fi

# 4. Konteyneri çalıştır (Local directory mapping)
echo -e "${BLUE}🚢 Konteyner çalıştırılıyor...${NC}"
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:5000 \
    -v "$MONGO_DATA":/data/db \
    -v "$UPLOAD_DATA":/app/server/uploads \
    -e PORT=5000 \
    -e MONGO_URI=mongodb://127.0.0.1:27017/losev-net \
    --restart unless-stopped \
    ${IMAGE_NAME}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Başarıyla çalıştırıldı!${NC}"
    echo -e "----------------------------------------"
    echo -e "🌐 Web & API: ${BLUE}http://localhost:${PORT}${NC}"
    echo -e "� Veri Yolu:  ${BLUE}$MONGO_DATA${NC}"
    echo -e "📜 Loglar:     ${BLUE}docker logs -f ${CONTAINER_NAME}${NC}"
    echo -e "----------------------------------------"
else
    echo -e "${RED}❌ Konteyner başlatılamadı!${NC}"
    exit 1
fi
