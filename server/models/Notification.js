const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'activity_approved',
            'activity_rejected',
            'activity_revision',
            'badge_earned',
            'certificate_granted',
            'streak_milestone'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedActivity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Okunmamış bildirimleri hızlı sorgulamak için index
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
