const Notification = require('../models/Notification');

// Kullanıcının bildirimlerini getir
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const notifications = await Notification.find({ user: req.user._id })
            .populate('relatedActivity', 'type hours date')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            read: false
        });

        const total = await Notification.countDocuments({ user: req.user._id });

        res.json({
            notifications,
            unreadCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Bildirimler alınırken hata oluştu', error: error.message });
    }
};

// Okunmamış bildirim sayısı
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            read: false
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Bildirim sayısı alınırken hata oluştu', error: error.message });
    }
};

// Bildirimi okundu olarak işaretle
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Bildirim bulunamadı' });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Bildirim güncellenirken hata oluştu', error: error.message });
    }
};

// Tüm bildirimleri okundu olarak işaretle
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { read: true }
        );
        res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
    } catch (error) {
        res.status(500).json({ message: 'Bildirimler güncellenirken hata oluştu', error: error.message });
    }
};

// Bildirim oluştur (internal helper, doğrudan route'a bağlı değil)
exports.createNotification = async ({ user, type, title, message, relatedActivity }) => {
    try {
        await Notification.create({ user, type, title, message, relatedActivity });
    } catch (error) {
        console.error('Bildirim oluşturma hatası:', error);
    }
};
