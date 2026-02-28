#!/usr/bin/env node
/**
 * Admin kullanıcı oluşturma script'i
 * Kullanım: node scripts/seed-admin.js [email]
 * Demo modda: email'in @ öncesi firebaseUid olarak kullanılır
 * Örnek: node scripts/seed-admin.js admin@losev.org
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const email = process.argv[2] || 'admin@losev.org';
const firebaseUid = email.split('@')[0];

async function seedAdmin() {
    await connectDB();
    try {
        let user = await User.findOne({ firebaseUid });
        if (user) {
            if (user.role === 'admin') {
                console.log('Admin zaten mevcut:', email);
                process.exit(0);
            }
            user.role = 'admin';
            await user.save();
            console.log('Kullanıcı admin yapıldı:', email);
        } else {
            user = await User.create({
                firebaseUid,
                email,
                name: 'Genel Merkez Admin',
                role: 'admin'
            });
            console.log('Yeni admin oluşturuldu:', email);
        }
        console.log('Giriş için demo modda e-posta:', email, 'şifre: herhangi (6+ karakter)');
    } catch (err) {
        console.error('Hata:', err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedAdmin();
