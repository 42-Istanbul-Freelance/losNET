const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const consentController = require('../controllers/consentController');

router.get('/info/:token', consentController.getConsentInfo);
router.post('/approve/:token', consentController.approveConsent);
router.get('/create', authenticate, consentController.createConsentRequest);

module.exports = router;
