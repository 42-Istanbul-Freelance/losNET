const crypto = require('crypto');
const User = require('../models/User');

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

exports.createConsentRequest = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Sadece öğrenciler için geçerlidir' });
        }
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await User.findByIdAndUpdate(req.user._id, {
            parentConsentToken: token,
            parentConsentTokenExpires: expiresAt
        });
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:8080';
        const consentUrl = `${baseUrl}/consent/${token}`;
        res.json({ consentUrl, expiresAt });
    } catch (error) {
        res.status(500).json({ message: 'Onay linki oluşturulamadı', error: error.message });
    }
};

exports.getConsentInfo = async (req, res) => {
    try {
        const token = req.params.token;
        const user = await User.findOne({
            parentConsentToken: token,
            parentConsentTokenExpires: { $gt: new Date() },
            parentConsent: { $ne: true }
        }).select('name grade school').populate('school', 'name');

        if (!user) {
            return res.status(404).json({
                valid: false,
                message: 'Link geçersiz veya süresi dolmuş'
            });
        }
        res.json({
            valid: true,
            studentName: user.name,
            grade: user.grade,
            schoolName: user.school?.name || '-'
        });
    } catch (error) {
        res.status(500).json({ message: 'Bilgi alınamadı', error: error.message });
    }
};

exports.approveConsent = async (req, res) => {
    try {
        const token = req.params.token;
        const user = await User.findOne({
            parentConsentToken: token,
            parentConsentTokenExpires: { $gt: new Date() },
            parentConsent: { $ne: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Link geçersiz veya süresi dolmuş'
            });
        }

        user.parentConsent = true;
        user.parentConsentAt = new Date();
        user.parentConsentToken = undefined;
        user.parentConsentTokenExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Veli onayı başarıyla kaydedildi',
            studentName: user.name
        });
    } catch (error) {
        res.status(500).json({ message: 'Onay kaydedilemedi', error: error.message });
    }
};
