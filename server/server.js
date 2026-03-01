const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Ortam değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Yüklenen dosyaları statik olarak sun
app.use('/uploads', express.static('uploads'));

// API Rotaları
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/consent', require('./routes/consentRoutes'));
app.use('/api/schools', require('./routes/schoolRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Sağlık kontrolü
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'LÖSEV İnci Gönüllülük Takip Sistemi API çalışıyor',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Hata yakalama middleware
app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err);
    res.status(500).json({
        message: 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Sunucu ${PORT} portunda çalışıyor`);
        console.log(`API: http://localhost:${PORT}/api/health`);
    });
}).catch((err) => {
    console.error('Sunucu başlatılamadı:', err);
    process.exit(1);
});

module.exports = app;
