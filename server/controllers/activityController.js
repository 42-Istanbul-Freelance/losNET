const Activity = require('../models/Activity');
const User = require('../models/User');
const School = require('../models/School');
const Certificate = require('../models/Certificate');
const { updateSchoolBadgeAfterActivity } = require('../services/schoolBadgeService');
const { createNotification } = require('./notificationController');

async function recalcStudentTotals(studentId) {
    const result = await Activity.aggregate([
        { $match: { 'participantStudents.student': studentId } },
        { $unwind: '$participantStudents' },
        { $match: { 'participantStudents.student': studentId, 'participantStudents.participationStatus': 'approved' } },
        { $group: { _id: null, totalHours: { $sum: '$hours' } } }
    ]);
    const totalHours = result.length > 0 ? result[0].totalHours : 0;

    const student = await User.findById(studentId).populate('school');
    if (!student) return null;

    const oldBadge = student.badgeLevel;
    student.totalHours = totalHours;
    const newBadge = student.calculateBadge();
    student.badgeLevel = newBadge;
    await student.save();

    if (newBadge !== oldBadge && newBadge !== 'none') {
        const badgeLabels = { bronze: 'Bronz İnci 🥉', silver: 'Gümüş İnci 🥈', gold: 'Altın İnci 🥇', platinum: 'Platin İnci Lideri 💎' };
        try {
            await Certificate.create({
                student: student._id,
                level: newBadge,
                totalHoursAtGrant: student.totalHours
            });
        } catch (certError) {
            if (certError.code !== 11000) {
                console.error('Sertifika oluşturma hatası:', certError);
            }
        }

        await createNotification({
            user: student._id,
            type: 'badge_earned',
            title: 'Yeni Rozet Kazandınız! 🏅',
            message: `Tebrikler! ${badgeLabels[newBadge]} rozetini kazandınız! (${student.totalHours} saat)`
        });
    }

    return student;
}

async function recalcSchoolTotals(schoolId) {
    if (!schoolId) return;
    const result = await Activity.aggregate([
        { $match: { school: schoolId } },
        { $unwind: '$participantStudents' },
        { $match: { 'participantStudents.participationStatus': 'approved' } },
        { $group: { _id: null, totalHours: { $sum: '$hours' } } }
    ]);
    const totalHours = result.length > 0 ? result[0].totalHours : 0;
    await School.findByIdAndUpdate(schoolId, { totalHours });
    await updateSchoolBadgeAfterActivity(schoolId);
}

// Yeni etkinlik oluştur (öğretmen/admin)
exports.createActivity = async (req, res) => {
    try {
        const { date, type, hours, description, location, participantCount, photos, documents, participantStudents, school: schoolFromBody } = req.body;

        // Teacher/admin faaliyeti kendi okulundan/tüm okullardan öğrencilerle oluşturabilir
        let school = null;
        if (req.user.role === 'teacher') {
            school = req.user.school;
        } else if (req.user.role === 'admin' && schoolFromBody) {
            school = schoolFromBody;
        }

        // Katılımcı öğrencileri işle
        let participants = [];
        if (participantStudents && Array.isArray(participantStudents)) {
            participants = participantStudents.map(studentId => ({
                student: studentId,
                participationStatus: 'invited',
                requestedAt: new Date()
            }));
        }

        // Admin okul göndermediyse, ilk katılımcıdan okul çıkar (varsa)
        if (req.user.role === 'admin' && !school && participants.length > 0) {
            const firstStudent = await User.findById(participants[0].student).select('school');
            if (firstStudent?.school) school = firstStudent.school;
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
            participantStudents: participants,
            isPrivate: req.body.isPrivate || false,
            status: 'approved' // etkinlikler yayınlanmış kabul edilir; saat/akış katılım onayıyla belirlenir
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

// Kullanıcının faaliyetlerini listele
exports.getActivities = async (req, res) => {
    try {
        const { status, type, startDate, endDate, search, page = 1, limit = 20, filter } = req.query;
        const query = {};

        // Öğrenci: etkinlikleri görür (okulunun etkinlikleri + kendisinin katıldığı/istek attığı)
        if (req.user.role === 'student') {
            query.creatorRole = { $in: ['teacher', 'admin'] };
            query.status = 'approved';
            query.$or = [
                { school: req.user.school, isPrivate: { $ne: true } },
                { 'participantStudents.student': req.user._id }
            ];

            // status filtresi öğrencide "katılım durumu" anlamına gelir
            if (status) {
                query.participantStudents = {
                    $elemMatch: {
                        student: req.user._id,
                        participationStatus: status
                    }
                };
            }
        }
        // Öğretmen okulundaki tüm faaliyetleri ve kendi oluşturduğu faaliyetleri görür
        else if (req.user.role === 'teacher') {
            if (filter === 'created') {
                query.createdBy = req.user._id;
                query.creatorRole = 'teacher';
            } else if (filter === 'approved') {
                query.participantStudents = {
                    $elemMatch: {
                        approvedBy: req.user._id,
                        participationStatus: 'approved'
                    }
                };
            } else {
                query.$or = [
                    { school: req.user.school },
                    { createdBy: req.user._id, creatorRole: 'teacher' }
                ];
            }
        }
        // Admin hepsini görür

        // teacher/admin için status filtrelemesi event-level kalır (legacy için)
        if (status && req.user.role !== 'student') {
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

// Onay bekleyen katılım istekleri (öğretmen/admin)
exports.getPendingActivities = async (req, res) => {
    try {
        const query = { 'participantStudents.participationStatus': 'pending' };

        // Öğretmen sadece kendi okulunun etkinliklerini ve kendi oluşturduklarını görür
        if (req.user.role === 'teacher') {
            query.$or = [
                { school: req.user.school },
                { createdBy: req.user._id, creatorRole: 'teacher' }
            ];
        }

        const activities = await Activity.find(query)
            .populate('createdBy', 'name email role')
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
        const student = await User.findById(req.params.studentId).select('name school');

        if (status === 'approved') {
            await createNotification({
                user: req.params.studentId,
                type: 'participation_approved',
                title: 'Katılım Onaylandı ✅',
                message: `Etkinliğe katılım talebiniz onaylandı.`,
                relatedActivity: activity._id
            });
            await recalcStudentTotals(req.params.studentId);
            const schoolId = activity.school || student?.school;
            await recalcSchoolTotals(schoolId);
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

// Öğrencinin daveti kabul ya da reddetmesi (öğrenci)
exports.respondToInvitation = async (req, res) => {
    try {
        const { accept } = req.body;
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ message: 'Faaliyet bulunamadı' });
        }

        const participantIndex = activity.participantStudents.findIndex(
            p => p.student.toString() === req.user._id.toString()
        );

        if (participantIndex === -1 || activity.participantStudents[participantIndex].participationStatus !== 'invited') {
            return res.status(400).json({ message: 'Geçerli bir davet bulunamadı' });
        }

        const participant = activity.participantStudents[participantIndex];
        participant.participationStatus = accept ? 'approved' : 'rejected';
        participant.approvedBy = req.user._id;
        participant.approvedAt = new Date();

        await activity.save();

        if (accept) {
            await recalcStudentTotals(req.user._id);
            const schoolId = activity.school || req.user.school;
            await recalcSchoolTotals(schoolId);
        }

        res.json({ message: accept ? 'Davet kabul edildi' : 'Davet reddedildi', activity });
    } catch (error) {
        res.status(500).json({ message: 'Davete yanıt verilirken hata oluştu', error: error.message });
    }
};

// Faaliyet güncelle (öğretmen/admin)
exports.updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Faaliyet bulunamadı' });
        }

        if (req.user.role === 'teacher' && activity.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Sadece kendi faaliyetlerinizi güncelleyebilirsiniz' });
        }

        const { date, type, hours, description, location, participantCount, photos, documents, participantStudents, isPrivate } = req.body;

        activity.date = date || activity.date;
        activity.type = type || activity.type;
        activity.hours = hours || activity.hours;
        activity.description = description !== undefined ? description : activity.description;
        activity.location = location !== undefined ? location : activity.location;
        activity.participantCount = participantCount !== undefined ? participantCount : activity.participantCount;
        activity.photos = photos || activity.photos;
        activity.documents = documents || activity.documents;
        if (isPrivate !== undefined) activity.isPrivate = isPrivate;

        if (participantStudents && Array.isArray(participantStudents)) {
            const currentStudents = activity.participantStudents.map(p => p.student.toString());
            const newStudents = participantStudents.filter(id => !currentStudents.includes(id));

            newStudents.forEach(studentId => {
                activity.participantStudents.push({
                    student: studentId,
                    participationStatus: 'invited',
                    requestedAt: new Date()
                });
            });
            // We do NOT remove existing students here to preserve their active statuses/hours.
        }

        await activity.save();
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Faaliyet güncellenirken hata oluştu', error: error.message });
    }
};

// Öğretmenin onayladığı öğrencilerin özetini getirir
exports.getApprovedStudentsInfo = async (req, res) => {
    try {
        const teacherId = req.user._id;

        const results = await Activity.aggregate([
            { $match: { 'participantStudents.approvedBy': teacherId, 'participantStudents.participationStatus': 'approved' } },
            { $unwind: '$participantStudents' },
            { $match: { 'participantStudents.approvedBy': teacherId, 'participantStudents.participationStatus': 'approved' } },
            {
                $group: {
                    _id: '$participantStudents.student',
                    totalHours: { $sum: '$hours' },
                    activityCount: { $sum: 1 },
                    activities: {
                        $push: {
                            _id: '$_id',
                            title: '$description',
                            type: '$type',
                            date: '$date',
                            hours: '$hours'
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            {
                $project: {
                    _id: 1,
                    totalHours: 1,
                    activityCount: 1,
                    activities: 1,
                    'studentInfo.name': 1,
                    'studentInfo.email': 1,
                    'studentInfo.grade': 1
                }
            },
            { $sort: { 'studentInfo.name': 1 } }
        ]);

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Onaylanan öğrenciler getirilirken hata oluştu', error: error.message });
    }
};

// Doğrulama kodu oluştur/yenile (Öğretmen/Admin)
exports.generateVerificationCode = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Faaliyet bulunamadı' });
        }

        // Yetki kontrolü
        if (req.user.role === 'teacher' && activity.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Sadece kendi faaliyetleriniz için kod oluşturabilirsiniz' });
        }

        // 6 haneli rastgele kod üret
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        activity.verificationCode = code;
        await activity.save();

        res.json({ message: 'Doğrulama kodu oluşturuldu', code });
    } catch (error) {
        res.status(500).json({ message: 'Kod oluşturulurken hata oluştu', error: error.message });
    }
};

// Kod ile katılım doğrula (Öğrenci)
exports.verifyActivityCode = async (req, res) => {
    try {
        const { code } = req.body;
        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Faaliyet bulunamadı' });
        }

        if (!activity.verificationCode) {
            return res.status(400).json({ message: 'Bu faaliyet için henüz bir doğrulama kodu oluşturulmamış' });
        }

        if (activity.verificationCode !== code) {
            return res.status(400).json({ message: 'Hatalı doğrulama kodu' });
        }

        // Katılımcıyı bul veya ekle
        let participant = activity.participantStudents.find(
            p => p.student.toString() === req.user._id.toString()
        );

        if (!participant) {
            // Eğer öğrenci listede yoksa ve aktivite gizli değilse ekle
            if (activity.isPrivate) {
                return res.status(403).json({ message: 'Bu özel faaliyete sadece davetli öğrenciler katılabilir' });
            }
            activity.participantStudents.push({
                student: req.user._id,
                participationStatus: 'approved',
                appliedAt: new Date(),
                approvedBy: activity.createdBy,
                approvedAt: new Date()
            });
        } else {
            // Varsa durumunu approved yap
            participant.participationStatus = 'approved';
            participant.approvedBy = activity.createdBy;
            participant.approvedAt = new Date();
        }

        await activity.save();
        await recalcStudentTotals(req.user._id);
        const schoolId = activity.school || req.user.school;
        await recalcSchoolTotals(schoolId);

        res.json({ message: 'Katılımınız başarıyla doğrulandı ve onaylandı', activity });
    } catch (error) {
        res.status(500).json({ message: 'Doğrulama sırasında hata oluştu', error: error.message });
    }
};
