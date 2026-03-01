#!/bin/bash

# EC2'ye Deploy Script

set -e

echo "🚀 EC2 Micro Instance'a Deploy Başlıyor..."

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Docker ve docker-compose kurulu mu kontrol et
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker bulunamadı, yükleniyor...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose bulunamadı, yükleniyor...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Sistem optimizasyonu yap
echo -e "${YELLOW}Sistem optimizasyonu yapılıyor...${NC}"
if [ -f "./optimize-ec2.sh" ]; then
    chmod +x optimize-ec2.sh
    ./optimize-ec2.sh
fi

# Eski container'ları durdur ve temizle
echo -e "${YELLOW}Eski container'lar temizleniyor...${NC}"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Image'leri build et (production modda)
echo -e "${YELLOW}Production image'ları oluşturuluyor...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

# Container'ları başlat
echo -e "${YELLOW}Container'lar başlatılıyor...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Healthcheck
echo -e "${YELLOW}Servisler kontrol ediliyor...${NC}"
sleep 10

if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deploy başarılı!${NC}"
    echo ""
    echo "📊 Çalışan Servisler:"
    docker compose -f docker-compose.prod.yml ps
    echo ""
    echo "💡 Logları görmek için: docker compose -f docker-compose.prod.yml logs -f"
    echo "💡 Durumu kontrol için: docker compose -f docker-compose.prod.yml ps"
    echo "💡 Durdurma için: docker compose -f docker-compose.prod.yml down"
else
    echo -e "${YELLOW}⚠️  Bazı servisler çalışmıyor olabilir${NC}"
    docker compose -f docker-compose.prod.yml logs
    exit 1
fi
