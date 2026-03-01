#!/bin/bash

# EC2 kaynak kullanımını izleme script'i

echo "📊 Losev-Net Kaynak Kullanımı Monitör"
echo "======================================"
echo ""

# Sistem belleği
echo "💾 Sistem Bellek Kullanımı:"
free -h
echo ""

# Docker container'ların kaynak kullanımı
echo "🐳 Container Kaynak Kullanımı:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

# Disk kullanımı
echo "💿 Disk Kullanımı:"
df -h / | tail -1
echo ""

# Docker volume boyutları
echo "📦 Volume Boyutları:"
docker system df -v | grep -A 20 "Local Volumes:"
echo ""

# Çalışan container'lar
echo "🏃 Çalışan Container'lar:"
docker compose -f docker-compose.prod.yml ps 2>/dev/null || docker compose ps
echo ""

# Son 10 log satırı
echo "📝 Son Loglar:"
docker compose -f docker-compose.prod.yml logs --tail=5 2>&1 | grep -v "Attaching" || docker compose logs --tail=5 2>&1 | grep -v "Attaching"
echo ""

echo "💡 Detaylı loglar için: docker compose -f docker-compose.prod.yml logs -f [service_name]"
echo "💡 Sürekli izleme için: watch -n 5 ./monitor.sh"
