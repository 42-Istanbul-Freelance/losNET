const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// POST /api/auth/register - Yeni kullanıcı kaydı
router.post('/register', authenticate, authController.register);

// GET /api/auth/me - Giriş yapan kullanıcının profili
router.get('/me', authenticate, authController.getMe);

// PUT /api/auth/profile - Profil güncelleme
router.put('/profile', authenticate, authController.updateProfile);

// GET /api/auth/pending-registrations - Onay bekleyen öğrencileri listele
router.get('/pending-registrations', authenticate, requireRole('teacher', 'admin'), authController.getPendingRegistrations);

// PUT /api/auth/approve-student/:userId - Öğrenci kaydını onayla
router.put('/approve-student/:userId', authenticate, requireRole('teacher', 'admin'), authController.approveStudent);

// PUT /api/auth/reject-student/:userId - Öğrenci kaydını reddet
router.put('/reject-student/:userId', authenticate, requireRole('teacher', 'admin'), authController.rejectStudent);

// PUT /api/auth/approve-teacher/:userId - Öğretmen kaydını onayla (SADECE admin)
router.put('/approve-teacher/:userId', authenticate, requireRole('admin'), authController.approveTeacher);

// PUT /api/auth/reject-teacher/:userId - Öğretmen kaydını reddet (SADECE admin)
router.put('/reject-teacher/:userId', authenticate, requireRole('admin'), authController.rejectTeacher);

module.exports = router;
