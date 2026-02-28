const Certificate = require('../models/Certificate');
const User = require('../models/User');

// Öğrencinin sertifikalarını getir
exports.getStudentCertificates = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user._id;

        const certificates = await Certificate.find({ student: studentId })
            .populate('student', 'name email totalHours')
            .sort({ grantedAt: -1 });

        const student = await User.findById(studentId).select('name totalHours badgeLevel');

        // Rozet bilgileri
        const badgeInfo = {
            bronze: { label: 'Bronz İnci', requiredHours: 25, emoji: '🥉' },
            silver: { label: 'Gümüş İnci', requiredHours: 50, emoji: '🥈' },
            gold: { label: 'Altın İnci', requiredHours: 100, emoji: '🥇' },
            platinum: { label: 'Platin İnci Lideri', requiredHours: 200, emoji: '💎' }
        };

        // Sonraki rozet hedefi
        let nextBadge = null;
        const currentHours = student ? student.totalHours : 0;
        if (currentHours < 25) nextBadge = { ...badgeInfo.bronze, remaining: 25 - currentHours };
        else if (currentHours < 50) nextBadge = { ...badgeInfo.silver, remaining: 50 - currentHours };
        else if (currentHours < 100) nextBadge = { ...badgeInfo.gold, remaining: 100 - currentHours };
        else if (currentHours < 200) nextBadge = { ...badgeInfo.platinum, remaining: 200 - currentHours };

        res.json({
            certificates,
            student,
            badgeInfo,
            nextBadge
        });
    } catch (error) {
        res.status(500).json({ message: 'Sertifikalar alınırken hata oluştu', error: error.message });
    }
};

// Saat eşiği kontrol (rozet kazanıldıysa sertifika oluştur)
exports.checkAndGrantCertificate = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user._id;
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Öğrenci bulunamadı' });
        }

        const newBadge = student.calculateBadge();
        const badgeLevels = ['bronze', 'silver', 'gold', 'platinum'];
        const newCertificates = [];

        // Tüm hak edilen ama henüz verilmemiş rozetleri kontrol et
        for (const level of badgeLevels) {
            const thresholds = { bronze: 25, silver: 50, gold: 100, platinum: 200 };
            if (student.totalHours >= thresholds[level]) {
                try {
                    const cert = await Certificate.create({
                        student: student._id,
                        level,
                        totalHoursAtGrant: student.totalHours
                    });
                    newCertificates.push(cert);
                } catch (err) {
                    // Zaten mevcutsa atla (unique index)
                    if (err.code !== 11000) throw err;
                }
            }
        }

        // Badge seviyesini güncelle
        if (student.badgeLevel !== newBadge) {
            student.badgeLevel = newBadge;
            await student.save();
        }

        res.json({
            currentBadge: newBadge,
            totalHours: student.totalHours,
            newCertificates
        });
    } catch (error) {
        res.status(500).json({ message: 'Sertifika kontrolü sırasında hata oluştu', error: error.message });
    }
};
