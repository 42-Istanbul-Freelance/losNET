const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController');

// POST /api/activities - Yeni faaliyet girişi (öğrenci)
router.post('/', authenticate, requireRole('student'), activityController.createActivity);

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

module.exports = router;
