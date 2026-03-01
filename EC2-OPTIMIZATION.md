# EC2 Micro Instance Optimizasyon Rehberi

Bu Docker ortamı AWS EC2 t2.micro/t3.micro (1 vCPU, 1GB RAM) için optimize edilmiştir.

## 🎯 Yapılan Optimizasyonlar

### 1. **Resource Limits (Bellek ve CPU)**
- MongoDB: 256MB max, 128MB reserved (cache: 250MB)
- API (Node.js): 256MB max, 128MB reserved
- Web (Nginx): 128MB max, 64MB reserved
- Nginx Proxy: 64MB max, 32MB reserved
- **Toplam RAM kullanımı: ~700MB** (300MB sistem için kaldı)

### 2. **MongoDB Optimizasyonu**
- `mongo:7-alpine` kullanımı (normal image'den %40 daha küçük)
- WiredTiger cache: 250MB ile sınırlandı
- Journal kapatıldı (`--nojournal`) - dev/test için
- Healthcheck interval artırıldı (10s)

### 3. **Client Optimizasyonu**
- **Multi-stage build**: Sadece built files deploy ediliyor
- Dev dependencies image'e dahil edilmiyor
- Nginx ile static serving (Node.js dev server yerine)
- Gzip compression aktif
- Static asset caching (1 yıl)

### 4. **Server Optimizasyonu**
- Node.js heap limit: 200MB
- `npm ci` kullanımı (daha hızlı ve deterministik)
- Production dependencies only
- npm cache temizleme

### 5. **Nginx Optimizasyonu**
- Worker connections: 512 (1024'ten düşürüldü)
- Gzip compression (5 seviye)
- Proxy caching (100MB disk cache)
- Rate limiting (10 req/s, burst 20)
- Keepalive connections
- Optimized timeouts

### 6. **Docker Optimizasyonu**
- `.dockerignore` ile gereksiz dosyalar hariç tutuldu
- Log rotation (10MB max, 3 file)
- Alpine images kullanımı
- Layer caching için optimize edilmiş Dockerfile

## 🚀 Kurulum (EC2'de)

### Otomatik Kurulum
```bash
# Repo'yu klonla
git clone <repo-url>
cd losev-net

# Deploy script'i çalıştır (her şeyi otomatik yapar)
./deploy-ec2.sh
```

### Manuel Kurulum

#### 1. Sistem Optimizasyonu
```bash
# Swap oluştur ve sistem ayarları
./optimize-ec2.sh
```

#### 2. Container'ları Başlat
```bash
# Build ve başlat
docker compose build
docker compose up -d

# Logları kontrol et
docker compose logs -f
```

## 📊 Monitoring

```bash
# Kaynak kullanımını izle
./monitor.sh

# Sürekli izleme (5 saniye aralıkla)
watch -n 5 ./monitor.sh

# Container logları
docker compose logs -f [service_name]

# Docker stats
docker stats
```

## 🔧 İlave Optimizasyon İpuçları

### 1. Swap Kullanımı
```bash
# Swap durumunu kontrol et
free -h
swapon --show

# Swappiness değerini düşür (az swap kullanımı)
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. OOM Killer'dan Korunma
```bash
# MongoDB için OOM killer'ı devre dışı bırak
docker update --oom-kill-disable=false losev-mongodb
```

### 3. Docker Temizlik
```bash
# Kullanılmayan image'leri temizle
docker system prune -af

# Volume'leri de temizle (DİKKAT: Veri kaybı!)
docker system prune -af --volumes
```

### 4. Build Cache Optimizasyonu
```bash
# BuildKit kullan (daha hızlı build)
export DOCKER_BUILDKIT=1
docker compose build
```

### 5. Production'da Journal Açma (MongoDB)
Eğer production kullanacaksanız, `docker-compose.yml` içinde:
```yaml
# Bu satırı değiştir:
command: mongod --wiredTigerCacheSizeGB 0.25 --nojournal

# Bununla:
command: mongod --wiredTigerCacheSizeGB 0.25
```

## ⚠️ Önemli Notlar

1. **Journal Kapalı**: MongoDB journal kapalı (daha az bellek). Production'da açmanız önerilir.

2. **Swap Gerekli**: 1GB RAM'de mutlaka swap oluşturun (1GB önerilir).

3. **Build Süresi**: İlk build 10-15 dakika sürebilir. Sabırlı olun.

4. **Healthcheck**: MongoDB başlaması 20-30 saniye sürebilir.

5. **Rate Limiting**: API için 10 req/s limit var. Gerekirse artırın.

## 🎛️ İnce Ayarlar

### Daha Az Bellek Kullanımı
```yaml
# docker-compose.yml'de daha da düşürme:
mongodb:
  command: mongod --wiredTigerCacheSizeGB 0.15 --nojournal
  deploy:
    resources:
      limits:
        memory: 200M
```

### Daha Fazla CPU
```yaml
# CPU limitlerini artırma (trade-off: daha fazla CPU spike'ı)
api:
  deploy:
    resources:
      limits:
        cpus: '0.5'  # 0.3'ten artırıldı
```

## 📈 Beklenen Performans

- **Başlangıç Süresi**: ~30-40 saniye
- **Bellek Kullanımı**: ~700-800MB (peak)
- **CPU Kullanımı**: Normal durumda %10-20
- **Response Time**: <500ms (normal yük)

## 🆘 Sorun Giderme

### Container Başlamıyor
```bash
# Logları kontrol et
docker compose logs

# Bellek durumunu kontrol et
free -h

# Swap'ı kontrol et
swapon --show
```

### Out of Memory
```bash
# Swap ekle
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Yavaş Çalışıyor
```bash
# Container stats kontrol et
docker stats

# En çok bellek kullanan service'i tespit et
# İlgili service'in limit'ini artır veya başka şeyleri kısıtla
```

## 📞 Destek

Sorun yaşarsanız:
1. `./monitor.sh` ile kaynak kullanımını kontrol edin
2. `docker compose logs` ile hata mesajlarını inceleyin
3. Gerekirse swap boyutunu artırın

---

**Son Güncelleme**: 2026-03-01
**Minimum Gereksinimler**: 1 vCPU, 1GB RAM, 10GB Disk
**Önerilen**: 1 vCPU, 1GB RAM + 1GB Swap, 20GB Disk
