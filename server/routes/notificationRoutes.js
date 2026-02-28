const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// GET /api/notifications - Bildirimleri listele
router.get('/', authenticate, notificationController.getNotifications);

// GET /api/notifications/unread-count - Okunmamış bildirim sayısı
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// PUT /api/notifications/:id/read - Bildirimi okundu yap
router.put('/:id/read', authenticate, notificationController.markAsRead);

// PUT /api/notifications/read-all - Tümünü okundu yap
router.put('/read-all', authenticate, notificationController.markAllAsRead);

module.exports = router;
