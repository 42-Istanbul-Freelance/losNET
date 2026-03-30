const Activity = require('../models/Activity');
const User = require('../models/User');
const School = require('../models/School');
const Certificate = require('../models/Certificate');
const { updateSchoolBadgeAfterActivity } = require('../services/schoolBadgeService');
const { createNotification } = require('./notificationController');

// Yeni faaliyet oluştur (öğretmen/admin)
exports.createActivity = async (req, res) => {
    try {
        const { date, type, hours, description, location, participantCount, photos, documents, participantStudents } = req.body;

        // Teacher/admin faaliyeti kendi okulundan/tüm okullardan öğrencilerle oluşturabilir
        let school = null;
        if (req.user.role === 'teacher') {
            school = req.user.school;
        }

        // Katılımcı öğrencileri işle
        let participants = [];
        if (participantStudents && Array.isArray(participantStudents)) {
            participants = participantStudents.map(studentId => ({
                student: studentId,
                participationStatus: 'pending',
                requestedAt: new Date()
            }));
        }

        const activity = await Activity.create({
            createdBy: req.user._id,
            creatorRole: req.user.role,
            student: null, // Teacher/admin activities'de student field null
            school: school,
            date,
            type,
            hours,
            description,
            location,
            participantCount,
            photos: photos || [],
            documents: documents || [],
            participantStudents: participants
        });

        const populatedActivity = await Activity.findById(activity._id)
            .populate('createdBy', 'name email role')
            .populate('participantStudents.student', 'name email grade')
            .populate('school', 'name city');

        res.status(201).json(populatedActivity);
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

        // Sadece kendi faaliyetini düzenleyebilir (student tarafından oluşturulan faaliyetler)
        if (activity.createdBy.toString() !== req.user._id.toString() || activity.creatorRole !== 'student') {
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
            .populate('createdBy', 'name email role')
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

        // Öğrenci kendi faaliyetlerini ve katılabilecekleri faaliyetleri görür
        if (req.user.role === 'student') {
            query.$or = [
                { createdBy: req.user._id, creatorRole: 'student' }, // Kendi oluşturduğu faaliyetler
                { 'participantStudents.student': req.user._id } // Katılmak için davet edilen faaliyetler
            ];
        }
        // Öğretmen okulundaki tüm faaliyetleri ve kendi oluşturduğu faaliyetleri görür
        else if (req.user.role === 'teacher') {
            query.$or = [
                { school: req.user.school },
                { createdBy: req.user._id, creatorRole: 'teacher' }
            ];
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
            .populate('createdBy', 'name email role')
            .populate('student', 'name email grade')
            .populate('participantStudents.student', 'name email grade')
            .populate('school', 'name city')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Adına göre arama (populate sonrası filter)
        if (search && req.user.role !== 'student') {
            const searchLower = search.toLowerCase();
            activities = activities.filter(a => {
                const creatorName = a.createdBy?.name?.toLowerCase() || '';
                const studentName = a.student?.name?.toLowerCase() || '';
                return creatorName.includes(searchLower) || studentName.includes(searchLower);
            });
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
            .populate('createdBy', 'name email role')
            .populate('student', 'name email grade school')
            .populate('participantStudents.student', 'name email grade')
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

        // Öğretmen sadece kendi okulunun faaliyetlerini ve kendi oluşturduklarını görür
        if (req.user.role === 'teacher') {
            query.$or = [
                { school: req.user.school },
                { createdBy: req.user._id, creatorRole: 'teacher' }
            ];
        }

        const activities = await Activity.find(query)
            .populate('createdBy', 'name email role')
            .populate('student', 'name email grade')
            .populate('participantStudents.student', 'name email grade')
            .populate('school', 'name city')
            .sort({ createdAt: -1 });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Bekleyen faaliyetler alınırken hata oluştu', error: error.message });
    }
};

// Öğrencinin etkinliğe katılım isteği (öğrenci)
exports.requestParticipation = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Faaliyet bulunamadı' });
        }

        // Teacher/admin tarafından oluşturulan etkinliklere katılım istenebilir
        if (activity.creatorRole === 'student') {
            return res.status(400).json({ message: 'Bu faaliyet türüne katılım isteği gönderilemez' });
        }

        // Zaten katılım isteği gönderip göndermedik kontrol et
        const existingRequest = activity.participantStudents.find(
            p => p.student.toString() === req.user._id.toString()
        );
        if (existingRequest) {
            return res.status(400).json({ message: 'Zaten bu faaliyete katılım isteği gönderdiniz' });
        }

        // Katılım isteği ekle
        activity.participantStudents.push({
            student: req.user._id,
            participationStatus: 'pending',
            requestedAt: new Date()
        });
        await activity.save();

        // Notification gönder (öğretmene)
        const { createNotification } = require('./notificationController');
        await createNotification({
            user: activity.createdBy,
            type: 'participation_requested',
            title: 'Yeni Katılım İsteği',
            message: `${req.user.name} etkinliğe katılmak istiyor.`,
            relatedActivity: activity._id
        });

        const populatedActivity = await Activity.findById(activity._id)
            .populate('participantStudents.student', 'name email grade');

        res.status(201).json({
            message: 'Katılım isteği gönderildi',
            activity: populatedActivity
        });
    } catch (error) {
        res.status(500).json({ message: 'Katılım isteği gönderilirken hata oluştu', error: error.message });
    }
};

// Katılımı onayla/reddet (öğretmen/admin)
exports.approveParticipation = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Geçersiz durum değeri' });
        }

        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Faaliyet bulunamadı' });
        }

        // Katılımcıyı bul
        const participantIndex = activity.participantStudents.findIndex(
            p => p.student.toString() === req.params.studentId
        );
        if (participantIndex === -1) {
            return res.status(404).json({ message: 'Katılımcı bulunamadı' });
        }

        const participant = activity.participantStudents[participantIndex];
        participant.participationStatus = status;
        participant.approvedBy = req.user._id;
        participant.approvedAt = new Date();
        if (status === 'rejected') {
            participant.rejectionReason = rejectionReason || '';
        }

        await activity.save();

        // Notification gönder (öğrenciye)
        const { createNotification } = require('./notificationController');
        const student = await User.findById(req.params.studentId);

        if (status === 'approved') {
            await createNotification({
                user: req.params.studentId,
                type: 'participation_approved',
                title: 'Katılım Onaylandı ✅',
                message: `Etkinliğe katılım talebiniz onaylandı.`,
                relatedActivity: activity._id
            });
        } else {
            await createNotification({
                user: req.params.studentId,
                type: 'participation_rejected',
                title: 'Katılım Reddedildi ❌',
                message: `Etkinliğe katılım talebiniz reddedildi.${rejectionReason ? ' Neden: ' + rejectionReason : ''}`,
                relatedActivity: activity._id
            });
        }

        const updatedActivity = await Activity.findById(activity._id)
            .populate('participantStudents.student', 'name email grade')
            .populate('createdBy', 'name email role');

        res.json(updatedActivity);
    } catch (error) {
        res.status(500).json({ message: 'Katılım işlemi sırasında hata oluştu', error: error.message });
    }
};
