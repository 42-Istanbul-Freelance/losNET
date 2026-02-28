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
