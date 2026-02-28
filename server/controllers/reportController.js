const Activity = require('../models/Activity');
const User = require('../models/User');
const School = require('../models/School');
const { updateSchoolBadges } = require('../services/schoolBadgeService');

// Öğrenci saat özeti
exports.getStudentHours = async (req, res) => {
    try {
        const studentId = req.params.id || req.user._id;

        // Toplam saat
        const totalResult = await Activity.aggregate([
            { $match: { student: studentId, status: 'approved' } },
            { $group: { _id: null, totalHours: { $sum: '$hours' } } }
        ]);

        // Aylık saat (son 12 ay)
        const monthlyResult = await Activity.aggregate([
            { $match: { student: studentId, status: 'approved' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    hours: { $sum: '$hours' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        // Yıllık saat
        const yearlyResult = await Activity.aggregate([
            { $match: { student: studentId, status: 'approved' } },
            {
                $group: {
                    _id: { year: { $year: '$date' } },
                    hours: { $sum: '$hours' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1 } }
        ]);

        // Etkinlik türü dağılımı
        const typeResult = await Activity.aggregate([
            { $match: { student: studentId, status: 'approved' } },
            {
                $group: {
                    _id: '$type',
                    hours: { $sum: '$hours' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const user = await User.findById(studentId).populate('school');
        const targetHours = user?.school?.targetHours || 40;
        res.json({
            totalHours: totalResult.length > 0 ? totalResult[0].totalHours : 0,
            monthly: monthlyResult,
            yearly: yearlyResult,
            byType: typeResult,
            targetHours
        });
    } catch (error) {
        res.status(500).json({ message: 'Saat raporu alınırken hata oluştu', error: error.message });
    }
};

// Okul bazlı rapor
exports.getSchoolReport = async (req, res) => {
    try {
        const schoolId = req.params.id || (req.user.school ? req.user.school._id || req.user.school : null);

        if (!schoolId) {
            return res.status(400).json({ message: 'Okul bilgisi bulunamadı' });
        }

        const school = await School.findById(schoolId);

        // Okuldaki öğrenciler
        const students = await User.find({ school: schoolId, role: 'student' })
            .select('name totalHours badgeLevel grade')
            .sort({ totalHours: -1 });

        // Aylık trend
        const monthlyTrend = await Activity.aggregate([
            { $match: { school: schoolId, status: 'approved' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    hours: { $sum: '$hours' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        // Etkinlik türü dağılımı
        const typeDistribution = await Activity.aggregate([
            { $match: { school: schoolId, status: 'approved' } },
            {
                $group: {
                    _id: '$type',
                    hours: { $sum: '$hours' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            school,
            students,
            monthlyTrend,
            typeDistribution,
            totalStudents: students.length,
            totalHours: school ? school.totalHours : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Okul raporu alınırken hata oluştu', error: error.message });
    }
};

// Genel merkez: tüm istatistikler
exports.getOverview = async (req, res) => {
    try {
        await updateSchoolBadges();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalSchools = await School.countDocuments();

        const totalHoursResult = await Activity.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, totalHours: { $sum: '$hours' }, count: { $sum: 1 } } }
        ]);

        const pendingCount = await Activity.countDocuments({ status: 'pending' });

        // İl bazlı dağılım
        const cityDistribution = await School.aggregate([
            {
                $group: {
                    _id: '$city',
                    schoolCount: { $sum: 1 },
                    totalHours: { $sum: '$totalHours' }
                }
            },
            { $sort: { totalHours: -1 } }
        ]);

        res.json({
            totalStudents,
            totalTeachers,
            totalSchools,
            totalHours: totalHoursResult.length > 0 ? totalHoursResult[0].totalHours : 0,
            totalActivities: totalHoursResult.length > 0 ? totalHoursResult[0].count : 0,
            pendingActivities: pendingCount,
            cityDistribution
        });
    } catch (error) {
        res.status(500).json({ message: 'Genel rapor alınırken hata oluştu', error: error.message });
    }
};

// En aktif 10 öğrenci
exports.getTopStudents = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const students = await User.find({ role: 'student' })
            .select('name totalHours badgeLevel school city')
            .populate('school', 'name city')
            .sort({ totalHours: -1 })
            .limit(limit);

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'En aktif öğrenciler alınırken hata oluştu', error: error.message });
    }
};

// En aktif 10 okul
exports.getTopSchools = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const schools = await School.find()
            .sort({ totalHours: -1 })
            .limit(limit);

        res.json(schools);
    } catch (error) {
        res.status(500).json({ message: 'En aktif okullar alınırken hata oluştu', error: error.message });
    }
};

// Etkinlik türü dağılımı (genel)
exports.getActivityTypeStats = async (req, res) => {
    try {
        const stats = await Activity.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: '$type',
                    totalHours: { $sum: '$hours' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalHours: -1 } }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Etkinlik türü istatistikleri alınırken hata oluştu', error: error.message });
    }
};

// Aylık faaliyet dağılımı (genel)
exports.getMonthlyStats = async (req, res) => {
    try {
        const stats = await Activity.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    totalHours: { $sum: '$hours' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Aylık istatistikler alınırken hata oluştu', error: error.message });
    }
};

// Öğrencinin okul içi sıralaması
exports.getSchoolRanking = async (req, res) => {
    try {
        const studentId = req.user._id;
        const schoolId = req.user.school?._id || req.user.school;

        if (!schoolId) {
            return res.json({ rank: null, total: 0, message: 'Okul bilgisi bulunamadı' });
        }

        const students = await User.find({ school: schoolId, role: 'student' })
            .select('_id totalHours')
            .sort({ totalHours: -1 });

        const rank = students.findIndex(s => s._id.toString() === studentId.toString()) + 1;

        res.json({
            rank: rank || null,
            total: students.length,
            topStudents: students.slice(0, 5).map((s, i) => ({
                rank: i + 1,
                totalHours: s.totalHours
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Sıralama alınırken hata oluştu', error: error.message });
    }
};

// Öğrenci streak hesaplama (üst üste faaliyet girilen haftalar)
exports.getStudentStreak = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Son 6 ayın faaliyetlerini al
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const activities = await Activity.find({
            student: studentId,
            status: 'approved',
            date: { $gte: sixMonthsAgo }
        }).sort({ date: -1 });

        if (activities.length === 0) {
            return res.json({ currentStreak: 0, longestStreak: 0, totalWeeksActive: 0 });
        }

        // Hafta bazlı grupla
        const weekSet = new Set();
        activities.forEach(a => {
            const d = new Date(a.date);
            const yearWeek = `${d.getFullYear()}-W${getWeekNumber(d)}`;
            weekSet.add(yearWeek);
        });

        // Mevcut haftadan geriye doğru streak hesapla
        const now = new Date();
        let currentStreak = 0;
        let checkDate = new Date(now);

        for (let i = 0; i < 26; i++) {
            const yearWeek = `${checkDate.getFullYear()}-W${getWeekNumber(checkDate)}`;
            if (weekSet.has(yearWeek)) {
                currentStreak++;
            } else if (i > 0) {
                break;
            }
            checkDate.setDate(checkDate.getDate() - 7);
        }

        res.json({
            currentStreak,
            totalWeeksActive: weekSet.size,
            totalActivities: activities.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Streak hesaplanırken hata oluştu', error: error.message });
    }
};

// Hafta numarasını hesapla (ISO week)
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// CSV export (admin)
exports.exportStudentsCsv = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .populate('school', 'name city')
            .sort({ totalHours: -1 });

        const badgeLabels = { none: 'Yok', bronze: 'Bronz', silver: 'Gümüş', gold: 'Altın', platinum: 'Platin' };

        let csv = 'Ad Soyad,E-posta,Telefon,Okul,İl,İlçe,Sınıf,Toplam Saat,Rozet,Kayıt Tarihi\n';
        students.forEach(s => {
            csv += `"${s.name}","${s.email}","${s.phone || ''}","${s.school?.name || ''}","${s.city || ''}","${s.district || ''}","${s.grade || ''}",${s.totalHours},"${badgeLabels[s.badgeLevel] || 'Yok'}","${new Date(s.createdAt).toLocaleDateString('tr-TR')}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=ogrenci_raporu.csv');
        // BOM for Turkish characters in Excel
        res.send('\uFEFF' + csv);
    } catch (error) {
        res.status(500).json({ message: 'CSV export hatası', error: error.message });
    }
};

// Faaliyet takvimi için günlük veri (öğrenci)
exports.getActivityCalendar = async (req, res) => {
    try {
        const studentId = req.params.id || req.user._id;
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        const dailyData = await Activity.aggregate([
            {
                $match: {
                    student: studentId,
                    status: 'approved',
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        day: { $dayOfMonth: '$date' }
                    },
                    hours: { $sum: '$hours' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.json({ year, calendar: dailyData });
    } catch (error) {
        res.status(500).json({ message: 'Takvim verisi alınırken hata oluştu', error: error.message });
    }
};
