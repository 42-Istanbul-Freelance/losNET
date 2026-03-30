const express = require('express');
const router = express.Router();
const { authenticate, requireRole, requireApprovedRegistration } = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController');

// POST /api/activities - Yeni etkinlik oluştur (öğretmen/admin)
router.post('/', authenticate, requireRole('teacher', 'admin'), requireApprovedRegistration, activityController.createActivity);

// PUT /api/activities/:id - Etkinlik güncelle (öğretmen/admin)
router.put('/:id', authenticate, requireRole('teacher', 'admin'), requireApprovedRegistration, activityController.updateActivity);

// GET /api/activities - Faaliyetleri listele (rol bazlı)
router.get('/', authenticate, activityController.getActivities);

// GET /api/activities/pending - Onay bekleyen katılım istekleri (öğretmen/admin)
router.get('/pending', authenticate, requireRole('teacher', 'admin'), requireApprovedRegistration, activityController.getPendingActivities);

// GET /api/activities/:id - Faaliyet detayı
router.get('/:id', authenticate, activityController.getActivityById);

// POST /api/activities/:id/participation-request - Öğrenci etkinliğe katılım isteği
router.post('/:id/participation-request', authenticate, requireRole('student'), requireApprovedRegistration, activityController.requestParticipation);

// PUT /api/activities/:id/participation/:studentId - Katılımı onayla/reddet (öğretmen/admin)
router.put('/:id/participation/:studentId', authenticate, requireRole('teacher', 'admin'), requireApprovedRegistration, activityController.approveParticipation);

// POST /api/activities/:id/respond-invitation - Öğrencinin daveti kabul/reddetmesi
router.post('/:id/respond-invitation', authenticate, requireRole('student'), requireApprovedRegistration, activityController.respondToInvitation);

module.exports = router;
