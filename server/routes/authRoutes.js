const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// POST /api/auth/register - Yeni kullanıcı kaydı
router.post('/register', authenticate, authController.register);

// GET /api/auth/me - Giriş yapan kullanıcının profili
router.get('/me', authenticate, authController.getMe);

// PUT /api/auth/profile - Profil güncelleme
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
