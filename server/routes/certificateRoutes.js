const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const certificateController = require('../controllers/certificateController');

// GET /api/certificates/:studentId - Öğrencinin sertifikaları
router.get('/:studentId', authenticate, certificateController.getStudentCertificates);

// GET /api/certificates - Kendi sertifikalarım
router.get('/', authenticate, certificateController.getStudentCertificates);

// POST /api/certificates/check - Rozet kontrolü
router.post('/check', authenticate, certificateController.checkAndGrantCertificate);

module.exports = router;
