const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

// GET /api/reports/student/:id/hours - Öğrenci saat özeti
router.get('/student/:id/hours', authenticate, reportController.getStudentHours);

// GET /api/reports/my-hours - Kendi saat özetim
router.get('/my-hours', authenticate, reportController.getStudentHours);

// GET /api/reports/school/:id - Okul bazlı rapor
router.get('/school/:id', authenticate, requireRole('teacher', 'admin'), reportController.getSchoolReport);

// GET /api/reports/my-school - Kendi okulumun raporu
router.get('/my-school', authenticate, requireRole('teacher'), reportController.getSchoolReport);

// GET /api/reports/overview - Genel merkez istatistikleri
router.get('/overview', authenticate, requireRole('admin'), reportController.getOverview);

// GET /api/reports/top-students - En aktif 10 öğrenci
router.get('/top-students', authenticate, requireRole('admin'), reportController.getTopStudents);

// GET /api/reports/top-schools - En aktif 10 okul
router.get('/top-schools', authenticate, requireRole('admin'), reportController.getTopSchools);

// GET /api/reports/activity-types - Etkinlik türü dağılımı
router.get('/activity-types', authenticate, requireRole('admin'), reportController.getActivityTypeStats);

// GET /api/reports/monthly - Aylık faaliyet dağılımı
router.get('/monthly', authenticate, requireRole('admin'), reportController.getMonthlyStats);

module.exports = router;
