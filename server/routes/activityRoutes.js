const express = require('express');
const router = express.Router();
const { authenticate, requireRole, requireApprovedRegistration } = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController');

// POST /api/activities - Yeni faaliyet girişi (öğretmen/admin)
router.post('/', authenticate, requireRole('teacher', 'admin'), activityController.createActivity);

// GET /api/activities - Faaliyetleri listele (rol bazlı)
router.get('/', authenticate, activityController.getActivities);

// GET /api/activities/pending - Onay bekleyen faaliyetler (öğretmen/admin)
router.get('/pending', authenticate, requireRole('teacher', 'admin'), activityController.getPendingActivities);

// GET /api/activities/:id - Faaliyet detayı
router.get('/:id', authenticate, activityController.getActivityById);

// PUT /api/activities/:id - Faaliyet güncelle (öğrenci - düzenleme istenen/reddedilenler)
router.put('/:id', authenticate, requireRole('student'), activityController.updateActivity);

// PUT /api/activities/:id/review - Onay/red/düzenleme (öğretmen/admin)
router.put('/:id/review', authenticate, requireRole('teacher', 'admin'), activityController.reviewActivity);

// POST /api/activities/:id/participation-request - Öğrenci etkinliğe katılım isteği
router.post('/:id/participation-request', authenticate, requireRole('student'), requireApprovedRegistration, activityController.requestParticipation);

// PUT /api/activities/:id/participation/:studentId - Katılımı onayla/reddet (öğretmen/admin)
router.put('/:id/participation/:studentId', authenticate, requireRole('teacher', 'admin'), activityController.approveParticipation);

module.exports = router;
