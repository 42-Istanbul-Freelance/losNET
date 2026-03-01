#!/bin/bash

# EC2'de Hızlı Test ve Troubleshooting

echo "🔍 EC2 Losev-Net Troubleshooting"
echo "================================="
echo ""

# Container durumlarını kontrol et
echo "📦 Container Durumları:"
docker-compose -f docker-compose.prod.yml ps
echo ""

# MongoDB healthcheck
echo "💚 MongoDB Health Check:"
docker exec losev-mongodb mongosh --quiet --eval "db.runCommand({ ping: 1 })" 2>/dev/null && echo "✅ MongoDB çalışıyor" || echo "❌ MongoDB çalışmıyor"
echo ""

# MongoDB logları
echo "📝 MongoDB Logları (son 20 satır):"
docker logs losev-mongodb --tail 20
echo ""

# API logları
echo "📝 API Logları (son 20 satır):"
docker logs losev-api --tail 20
echo ""

# Bellek kullanımı
echo "💾 Bellek Kullanımı:"
free -h
echo ""

# Container stats
echo "📊 Container İstatistikleri:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

echo "💡 İpuçları:"
echo "  - MongoDB'nin başlaması 30-60 saniye sürebilir"
echo "  - API, MongoDB hazır olana kadar 5 kez tekrar dener (25 saniye)"
echo "  - Yeniden başlatmak için: docker-compose -f docker-compose.prod.yml restart"
echo "  - Logları izlemek için: docker-compose -f docker-compose.prod.yml logs -f"
