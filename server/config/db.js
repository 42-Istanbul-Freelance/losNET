const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`MongoDB bağlantı denemesi ${i + 1}/${retries} başarısız: ${error.message}`);
            
            if (i === retries - 1) {
                console.error('MongoDB bağlantısı kurulamadı. Uygulama sonlandırılıyor.');
                process.exit(1);
            }
            
            console.log(`${delay / 1000} saniye sonra tekrar denenecek...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

module.exports = connectDB;
