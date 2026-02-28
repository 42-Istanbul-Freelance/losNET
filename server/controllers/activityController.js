const Activity = require('../models/Activity');
const User = require('../models/User');
const School = require('../models/School');
const Certificate = require('../models/Certificate');
const { updateSchoolBadgeAfterActivity } = require('../services/schoolBadgeService');

// Yeni faaliyet oluştur (öğrenci)
exports.createActivity = async (req, res) => {
    try {
        const { date, type, hours, description, photos, documents } = req.body;

        const activity = await Activity.create({
            student: req.user._id,
            school: req.user.school,
            date,
            type,
            hours,
            description,
            photos: photos || [],
            documents: documents || []
        });

        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Faaliyet oluşturulurken hata oluştu', error: error.message });
    }
};

// Kullanıcının faaliyetlerini listele
exports.getActivities = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
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

        const activities = await Activity.find(query)
            .populate('student', 'name email grade')
            .populate('school', 'name city')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

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

                // Yeni rozet kazanıldıysa sertifika oluştur
                if (newBadge !== oldBadge && newBadge !== 'none') {
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
