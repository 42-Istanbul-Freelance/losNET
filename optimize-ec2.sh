#!/bin/bash

# EC2 Micro Instance için Sistem Optimizasyonu

echo "🔧 EC2 Micro Instance optimizasyonu başlatılıyor..."

# Swap oluştur (1GB - bellek eksikliklerini önlemek için)
if [ ! -f /swapfile ]; then
    echo "📝 Swap dosyası oluşturuluyor..."
    sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    # Kalıcı hale getir
    if ! grep -q "/swapfile" /etc/fstab; then
        echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
    fi
    
    # Swappiness ayarla (10 = minimum swap kullanımı)
    echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "✅ Swap oluşturuldu"
else
    echo "✅ Swap zaten mevcut"
fi

# Docker için bellek ayarları
echo "🐳 Docker ayarları yapılıyor..."
sudo mkdir -p /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "storage-driver": "overlay2"
}
EOF

# Docker servisini yeniden başlat
sudo systemctl restart docker

# Kullanılmayan Docker image'leri temizle
echo "🧹 Docker temizliği yapılıyor..."
docker system prune -af --volumes

echo "✅ Optimizasyon tamamlandı!"
echo ""
echo "📊 Sistem Durumu:"
free -h
echo ""
df -h
echo ""
echo "🚀 Artık 'docker compose up -d' ile uygulamanızı başlatabilirsiniz"
