const admin = require('../config/firebase');
const User = require('../models/User');

/**
 * Auth Middleware
 * 1. Firebase ID token ile doğrulama (admin.app() varsa)
 * 2. Demo mod: Bearer token'ı uid olarak kabul eder
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
        }

        const token = authHeader.split(' ')[1];
        let decodedToken = { uid: token, email: `${token}@demo.local` };

        if (admin.app && typeof admin.auth === 'function') {
            try {
                const decoded = await admin.auth().verifyIdToken(token);
                decodedToken = { uid: decoded.uid, email: decoded.email };
            } catch (firebaseErr) {
                if (token.includes('@') || token.length < 20) {
                    decodedToken = { uid: token, email: `${token}@demo.local` };
                } else {
                    throw firebaseErr;
                }
            }
        }

        const user = await User.findOne({ firebaseUid: decodedToken.uid }).populate('school');
        req.firebaseUser = decodedToken;
        req.user = user || null;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }
};

/**
 * Rol bazlı erişim kontrolü
 * @param  {...string} roles - İzin verilen roller
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Kullanıcı profili bulunamadı' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Bu işlem için yetkiniz bulunmamaktadır'
            });
        }

        next();
    };
};

module.exports = { authenticate, requireRole };
