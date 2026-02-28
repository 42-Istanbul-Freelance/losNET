const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const School = require('../models/School');

router.patch('/:id/target-hours', authenticate, requireRole('teacher', 'admin'), async (req, res) => {
    try {
        const { targetHours } = req.body;
        if (![30, 40].includes(targetHours)) {
            return res.status(400).json({ message: 'Hedef saat 30 veya 40 olmalıdır' });
        }
        const school = await School.findById(req.params.id);
        if (!school) return res.status(404).json({ message: 'Okul bulunamadı' });
        const userSchoolId = req.user.school?._id || req.user.school;
        if (req.user.role === 'teacher' && userSchoolId?.toString() !== school._id.toString()) {
            return res.status(403).json({ message: 'Bu okulu düzenleme yetkiniz yok' });
        }
        school.targetHours = targetHours;
        await school.save();
        res.json(school);
    } catch (error) {
        res.status(500).json({ message: 'Güncellenemedi', error: error.message });
    }
});

module.exports = router;
