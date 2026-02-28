const Activity = require('../models/Activity');
const User = require('../models/User');
const School = require('../models/School');
const Certificate = require('../models/Certificate');
const { updateSchoolBadgeAfterActivity } = require('../services/schoolBadgeService');
const { createNotification } = require('./notificationController');

// Yeni faaliyet oluştur (öğrenci)
exports.createActivity = async (req, res) => {
    try {
        const { date, type, hours, description, location, participantCount, photos, documents } = req.body;

        const activity = await Activity.create({
            student: req.user._id,
            school: req.user.school,
            date,
            type,
            hours,
            description,
            location,
            participantCount,
            photos: photos || [],
            documents: documents || []
        });

        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Faaliyet oluşturulurken hata oluştu', error: error.message });
    }
};

// Faaliyet güncelle (öğrenci - revision_requested veya rejected durumundakiler)
exports.updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Faaliyet bulunamadı' });
        }

        // Sadece kendi faaliyetini düzenleyebilir
        if (activity.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bu faaliyeti düzenleme yetkiniz yok' });
        }

        // Sadece revision_requested veya rejected durumundaki faaliyetler düzenlenebilir
        if (!['revision_requested', 'rejected'].includes(activity.status)) {
            return res.status(400).json({ message: 'Bu faaliyet düzenlenemez, sadece düzenleme istenen veya reddedilen faaliyetler güncellenebilir' });
        }

        const { date, type, hours, description, location, participantCount, photos, documents } = req.body;

        activity.date = date || activity.date;
        activity.type = type || activity.type;
        activity.hours = hours || activity.hours;
        activity.description = description !== undefined ? description : activity.description;
        activity.location = location !== undefined ? location : activity.location;
        activity.participantCount = participantCount !== undefined ? participantCount : activity.participantCount;
        activity.photos = photos || activity.photos;
        activity.documents = documents || activity.documents;
        activity.status = 'pending'; // Tekrar onaya gönder
        activity.reviewNote = '';
        activity.reviewedBy = null;
        activity.reviewedAt = null;

        await activity.save();

        const updated = await Activity.findById(activity._id)
            .populate('student', 'name email grade')
            .populate('school', 'name city');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Faaliyet güncellenirken hata oluştu', error: error.message });
    }
};

// Kullanıcının faaliyetlerini listele
exports.getActivities = async (req, res) => {
    try {
        const { status, type, startDate, endDate, search, page = 1, limit = 20 } = req.query;
        const query = {};

        // Öğrenci kendi faaliyetlerini görür
        if (req.user.role === 'student') {
            query.student = req.user._id;
        }
        // Öğretmen okulundaki faaliyetleri görür
        else if (req.user.role === 'teacher') {
            query.school = req.user.school;
        }
        // Admin hepsini görür

        if (status) {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        let activities = await Activity.find(query)
            .populate('student', 'name email grade')
            .populate('school', 'name city')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Öğrenci adına göre arama (populate sonrası filter)
        if (search && req.user.role !== 'student') {
            const searchLower = search.toLowerCase();
            activities = activities.filter(a =>
                a.student?.name?.toLowerCase().includes(searchLower)
            );
        }

        const total = await Activity.countDocuments(query);

        res.json({
            activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Faaliyetler listelenirken hata oluştu', error: error.message });
    }
};

// Faaliyet detayı
exports.getActivityById = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id)
            .populate('student', 'name email grade school')
            .populate('school', 'name city')
            .populate('reviewedBy', 'name');

        if (!activity) {
            return res.status(404).json({ message: 'Faaliyet bulunamadı' });
        }

        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Faaliyet detayı alınırken hata oluştu', error: error.message });
    }
};

// Faaliyet onay/red/düzenleme talebi (öğretmen)
exports.reviewActivity = async (req, res) => {
    try {
        const { status, reviewNote } = req.body;

        if (!['approved', 'rejected', 'revision_requested'].includes(status)) {
            return res.status(400).json({ message: 'Geçersiz durum değeri' });
        }

        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Faaliyet bulunamadı' });
        }

        activity.status = status;
        activity.reviewNote = reviewNote || '';
        activity.reviewedBy = req.user._id;
        activity.reviewedAt = new Date();
        await activity.save();

        // Bildirim oluştur
        const typeLabels = {
            seminer: 'Seminer', stant: 'Stant', bagis: 'Bağış', kermes: 'Kermes',
            bilinclenme: 'Bilinçlendirme', sosyal_medya: 'Sosyal Medya',
            farkindalik: 'Farkındalık', diger: 'Diğer'
        };
        const activityLabel = typeLabels[activity.type] || activity.type;

        if (status === 'approved') {
            await createNotification({
                user: activity.student,
                type: 'activity_approved',
                title: 'Faaliyet Onaylandı ✅',
                message: `${activityLabel} faaliyetiniz (${activity.hours} saat) onaylandı.`,
                relatedActivity: activity._id
            });
        } else if (status === 'rejected') {
            await createNotification({
                user: activity.student,
                type: 'activity_rejected',
                title: 'Faaliyet Reddedildi ❌',
                message: `${activityLabel} faaliyetiniz reddedildi.${reviewNote ? ' Not: ' + reviewNote : ''}`,
                relatedActivity: activity._id
            });
        } else if (status === 'revision_requested') {
            await createNotification({
                user: activity.student,
                type: 'activity_revision',
                title: 'Düzenleme İstendi ✏️',
                message: `${activityLabel} faaliyetiniz için düzenleme istendi.${reviewNote ? ' Not: ' + reviewNote : ''}`,
                relatedActivity: activity._id
            });
        }

        // Eğer onaylandıysa, öğrencinin toplam saatini güncelle
        if (status === 'approved') {
            const student = await User.findById(activity.student);
            if (student) {
                // Onaylanan tüm faaliyetlerin toplam saatini hesapla
                const result = await Activity.aggregate([
                    { $match: { student: student._id, status: 'approved' } },
                    { $group: { _id: null, totalHours: { $sum: '$hours' } } }
                ]);

                student.totalHours = result.length > 0 ? result[0].totalHours : 0;

                // Rozet kontrolü
                const newBadge = student.calculateBadge();
                const oldBadge = student.badgeLevel;
                student.badgeLevel = newBadge;
                await student.save();

                // Yeni rozet kazanıldıysa sertifika oluştur ve bildirim gönder
                if (newBadge !== oldBadge && newBadge !== 'none') {
                    const badgeLabels = { bronze: 'Bronz İnci 🥉', silver: 'Gümüş İnci 🥈', gold: 'Altın İnci 🥇', platinum: 'Platin İnci Lideri 💎' };
                    try {
                        await Certificate.create({
                            student: student._id,
                            level: newBadge,
                            totalHoursAtGrant: student.totalHours
                        });
                    } catch (certError) {
                        // Zaten bu seviye sertifika varsa hata vermez
                        if (certError.code !== 11000) {
                            console.error('Sertifika oluşturma hatası:', certError);
                        }
                    }

                    await createNotification({
                        user: student._id,
                        type: 'badge_earned',
                        title: 'Yeni Rozet Kazandınız! 🏅',
                        message: `Tebrikler! ${badgeLabels[newBadge]} rozetini kazandınız! (${student.totalHours} saat)`,
                        relatedActivity: activity._id
                    });
                }

                // Okul toplam saatini güncelle ve rozet hesapla
                if (student.school) {
                    const schoolResult = await Activity.aggregate([
                        { $match: { school: student.school, status: 'approved' } },
                        { $group: { _id: null, totalHours: { $sum: '$hours' } } }
                    ]);
                    await School.findByIdAndUpdate(student.school, {
                        totalHours: schoolResult.length > 0 ? schoolResult[0].totalHours : 0
                    });
                    await updateSchoolBadgeAfterActivity(student.school);
                }
            }
        }

        const updatedActivity = await Activity.findById(activity._id)
            .populate('student', 'name email grade')
            .populate('school', 'name city')
            .populate('reviewedBy', 'name');

        res.json(updatedActivity);
    } catch (error) {
        res.status(500).json({ message: 'Faaliyet değerlendirme hatası', error: error.message });
    }
};

// Onay bekleyen faaliyetler (öğretmen)
exports.getPendingActivities = async (req, res) => {
    try {
        const query = { status: 'pending' };

        // Öğretmen sadece kendi okulunun faaliyetlerini görür
        if (req.user.role === 'teacher') {
            query.school = req.user.school;
        }

        const activities = await Activity.find(query)
            .populate('student', 'name email grade')
            .populate('school', 'name city')
            .sort({ createdAt: -1 });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Bekleyen faaliyetler alınırken hata oluştu', error: error.message });
    }
};
