const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const uploadController = require('../controllers/uploadController');

// POST /api/upload - Dosya yükleme
router.post('/', authenticate, uploadController.uploadMiddleware, uploadController.uploadFile);

module.exports = router;
