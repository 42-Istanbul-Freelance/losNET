# EC2 Hızlı Başlangıç Kılavuzu

## 🚀 İlk Kurulum (Tek Komut)

```bash
# Repo'yu klonla ve deploy et
git clone <your-repo> losev-net
cd losev-net
./deploy-ec2.sh
```

## 📋 Manuel Adımlar

### 1. Sistemi Hazırla
```bash
# Swap oluştur ve Docker ayarlarını yap
sudo ./optimize-ec2.sh
```

### 2. Production Deployment
```bash
# Build ve başlat
docker-compose -f docker-compose.prod.yml up --build -d

# Logları izle
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Durum Kontrolü
```bash
# Container durumu
docker-compose -f docker-compose.prod.yml ps

# Kaynak kullanımı
./monitor.sh

# Troubleshooting
./troubleshoot.sh
```

## ⚠️ Önemli Notlar

### Bellek Limitleri (EC2 t2.micro için)
- MongoDB: 256MB (swap: 384MB)
- API: 256MB (swap: 384MB)
- Web: 128MB (swap: 192MB)
- Nginx: 64MB (swap: 96MB)
- **Toplam: ~700MB + swap**

### Başlangıç Süreleri
- MongoDB: 30-60 saniye
- API: 10-30 saniye (MongoDB'den sonra)
- Web: 5-10 saniye
- Nginx: 2-5 saniye

### MongoDB Bağlantı Retry
API, MongoDB'ye bağlanırken 5 kez dener:
- Her deneme arası: 5 saniye
- Toplam bekleme: ~25 saniye
- Eğer MongoDB başlamamışsa API bekler

## 🐛 Yaygın Sorunlar

### MongoDB Unhealthy
```bash
# MongoDB loglarını kontrol et
docker logs losev-mongodb

# MongoDB'yi yeniden başlat
docker-compose -f docker-compose.prod.yml restart mongodb

# Manuel test
docker exec losev-mongodb mongosh --eval "db.runCommand({ ping: 1 })"
```

### API Başlamıyor
```bash
# API loglarını kontrol et
docker logs losev-api

# MongoDB'nin hazır olup olmadığını kontrol et
docker exec losev-mongodb mongosh --eval "db.adminCommand('ping')"

# API'yi yeniden başlat
docker-compose -f docker-compose.prod.yml restart api
```

### Out of Memory
```bash
# Bellek durumu
free -h

# Swap ekle (eğer yoksa)
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Kalıcı yap
echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
```

### Container Yeniden Başlatma Döngüsü
```bash
# Tüm logları kontrol et
docker-compose -f docker-compose.prod.yml logs

# Belirli bir container'ı kontrol et
docker logs losev-mongodb --tail 100

# Durdur, temizle, tekrar başlat
docker-compose -f docker-compose.prod.yml down
docker system prune -f
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Maintenance

### Logları Temizle
```bash
# Docker loglarını truncate et
sudo sh -c 'truncate -s 0 /var/lib/docker/containers/*/*-json.log'

# Veya tüm kullanılmayan kaynakları temizle
docker system prune -af
```

### Güncelleme
```bash
# Yeni kodu çek
git pull origin main

# Rebuild ve restart
docker-compose -f docker-compose.prod.yml up --build -d
```

### Yedekleme (MongoDB)
```bash
# MongoDB backup
docker exec losev-mongodb mongodump --out=/data/backup
docker cp losev-mongodb:/data/backup ./backup_$(date +%Y%m%d)

# Restore
docker cp ./backup losev-mongodb:/data/restore
docker exec losev-mongodb mongorestore /data/restore
```

## 📊 Monitoring Komutları

```bash
# Sürekli izleme
watch -n 2 'docker stats --no-stream'

# Bellek kullanımı
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Disk kullanımı
docker system df

# Network kontrol
docker network ls
docker network inspect losev-net_frontend
```

## 🌐 Uygulamaya Erişim

```bash
# Public IP'yi öğren
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Security Group'ta 8080 portunu aç
# AWS Console > EC2 > Security Groups > Edit Inbound Rules
# Type: Custom TCP, Port: 8080, Source: 0.0.0.0/0

# Tarayıcıda aç
http://<EC2-PUBLIC-IP>:8080
```

## 📝 Dosya Yapısı

- `docker-compose.yml` - Local development (resource limits yok)
- `docker-compose.prod.yml` - Production (EC2 için memory limits var)
- `deploy-ec2.sh` - Otomatik deployment script
- `optimize-ec2.sh` - Sistem optimizasyonu (swap, Docker config)
- `monitor.sh` - Kaynak kullanımı izleme
- `troubleshoot.sh` - Sorun tespit ve çözüm

## 🔐 Güvenlik İpuçları

1. **Environment Variables**: `.env` dosyası oluştur
```bash
MONGO_URI=mongodb://mongodb:27017/losev-net
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

2. **Nginx SSL**: Let's Encrypt ile SSL ekle
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

3. **Firewall**: UFW ile port kısıtla
```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 8080/tcp  # App
sudo ufw enable
```

## 💰 Maliyet Optimizasyonu

EC2 t2.micro ile ayda ~$8-10 maliyet:
- Gerekirse t3.micro kullan (burst credit daha iyi)
- Reserved Instance ile %40 tasarruf
- Spot Instance ile %70 tasarruf (ama kesinti riski var)

## 📞 Destek

Sorun yaşarsanız:
1. `./troubleshoot.sh` çalıştır
2. Logları kontrol et: `docker-compose -f docker-compose.prod.yml logs`
3. GitHub Issues'a detaylarla bildirin
