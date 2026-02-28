#!/usr/bin/env node
/**
 * Demo verisi oluşturma script'i
 * Kullanım: npm run seed:demo
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const School = require('../models/School');
const Activity = require('../models/Activity');
const Certificate = require('../models/Certificate');
const connectDB = require('../config/db');

async function clearCollections() {
    await User.deleteMany({});
    await School.deleteMany({});
    await Activity.deleteMany({});
    await Certificate.deleteMany({});
    console.log('Eski veriler temizlendi.');
}

async function seedDemo() {
    try {
        await connectDB();
        await clearCollections();

        // 1. Okul Oluştur
        const school = await School.create({
            name: 'LÖSEV İncek Koleji',
            city: 'Ankara',
            district: 'Gölbaşı',
            badge: 'inci_dostu',
            totalStudents: 1,
            totalHours: 120,
            targetHours: 40
        });
        console.log('Okul oluşturuldu:', school.name);

        // 2. Admin Oluştur
        const admin = await User.create({
            firebaseUid: 'admin',
            email: 'admin@demo.local',
            name: 'Genel Merkez (Demo)',
            role: 'admin'
        });
        console.log('Admin oluşturuldu:', admin.email);

        // 3. Öğretmen Oluştur
        const teacher = await User.create({
            firebaseUid: 'teacher',
            email: 'teacher@demo.local',
            name: 'Ayşe Öğretmen (Demo)',
            role: 'teacher',
            school: school._id,
            city: 'Ankara',
            district: 'Gölbaşı',
            phone: '05551234567'
        });
        console.log('Öğretmen oluşturuldu:', teacher.email);

        // 4. Öğrenci Oluştur
        const student = await User.create({
            firebaseUid: 'student',
            email: 'student@demo.local',
            name: 'Ali Öğrenci (Demo)',
            role: 'student',
            school: school._id,
            grade: '10-A',
            city: 'Ankara',
            district: 'Gölbaşı',
            phone: '05321234567',
            parentConsent: true,
            parentConsentAt: new Date(),
            totalHours: 120,
            badgeLevel: 'gold'
        });
        console.log('Öğrenci oluşturuldu:', student.email);

        // 5. Faaliyetler Oluştur
        const activities = [
            {
                student: student._id,
                school: school._id,
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 gün önce
                type: 'seminer',
                hours: 2,
                description: 'Kanser haftası kapsamında okulumuzda düzenlenen LÖSEV Farkındalık Seminerine katıldım. Seminerde sağlıklı beslenme ve kanserden korunma yolları hakkında detaylı bilgiler edindim.',
                location: 'Okul Konferans Salonu',
                participantCount: 150,
                status: 'approved',
                reviewedBy: teacher._id,
                reviewedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
            },
            {
                student: student._id,
                school: school._id,
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 gün önce
                type: 'stant',
                hours: 6,
                description: 'Hafta sonu AVM\'de açılan LÖSEV İyilik Standında görev aldım. Gelen ziyaretçilere LÖSEV\'in faaliyetlerini anlattık, el emeği ürünlerin satışına destek olduk ve bağışçı kazandırdık.',
                location: 'Kentpark AVM',
                participantCount: 500,
                status: 'approved',
                reviewedBy: teacher._id,
                reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            },
            {
                student: student._id,
                school: school._id,
                date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 gün önce
                type: 'kermes',
                hours: 4,
                description: 'Okulumuzun bahçesinde velilerin ve öğrencilerin katkılarıyla düzenlenen LÖSEV yararına kermeste satış sorumlusu olarak görev aldım. Toplanan tüm gelirler LÖSANTİ hastanesine bağışlandı.',
                location: 'Okul Bahçesi',
                participantCount: 300,
                status: 'approved',
                reviewedBy: teacher._id,
                reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            {
                student: student._id,
                school: school._id,
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 gün önce
                type: 'bilinclenme',
                hours: 3,
                description: '"Lösemi Bulaşıcı Değildir" temalı afişlerin mahallemizdeki dükkanlara ve okul panosuna asılması çalışmasına katıldım.',
                location: 'Gölbaşı Esnafı',
                participantCount: 50,
                status: 'approved',
                reviewedBy: teacher._id,
                reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                student: student._id,
                school: school._id,
                date: new Date(), // Bugün
                type: 'sosyal_medya',
                hours: 1,
                description: '2-8 Kasım Lösemili Çocuklar Haftası kapsamında sosyal medya hesaplarımdan farkındalık yaratıcı gönderiler hazırladım ve LÖSEV etiketleriyle paylaştım.',
                location: 'Instagram/Twitter',
                participantCount: 1200,
                status: 'pending'
            },
            {
                student: student._id,
                school: school._id,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                type: 'bagis',
                hours: 2,
                description: 'Bağış etkinliği',
                location: 'Bilinmiyor',
                status: 'rejected',
                reviewNote: 'Lütfen faaliyet açıklamasını daha detaylı yazınız. Hangi bağış kampanyasına ne şekilde destek olduğunuzu açıklayın.',
                reviewedBy: teacher._id,
                reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
            }
        ];

        await Activity.insertMany(activities);
        console.log(`${activities.length} adet faaliyet oluşturuldu.`);

        // 6. Sertifika Oluştur
        const certificates = [
            {
                student: student._id,
                level: 'bronze',
                totalHoursAtGrant: 25,
                grantedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
            },
            {
                student: student._id,
                level: 'silver',
                totalHoursAtGrant: 50,
                grantedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
            },
            {
                student: student._id,
                level: 'gold',
                totalHoursAtGrant: 120,
                grantedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            }
        ];

        await Certificate.insertMany(certificates);
        console.log(`${certificates.length} adet sertifika oluşturuldu.`);

        console.log('✅ Demo verisi başarıyla yüklendi!');
        console.log('--- Demo Giriş Bilgileri ---');
        console.log('👤 Öğrenci: student@demo.local');
        console.log('👩‍🏫 Öğretmen: teacher@demo.local');
        console.log('🏛️ Admin: admin@demo.local');
        console.log('Şifreler: Herhangi bir metin (en az 6 karakter)');

    } catch (err) {
        console.error('❌ Hata oluştu:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedDemo();
