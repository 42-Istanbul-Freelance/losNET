const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        index: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: [
            'seminer',
            'stant',
            'bagis',
            'kermes',
            'bilinclenme',
            'sosyal_medya',
            'farkindalik',
            'diger'
        ],
        required: true
    },
    hours: {
        type: Number,
        required: true,
        min: 0.5
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    participantCount: {
        type: Number,
        min: 1
    },
    photos: [{
        type: String
    }],
    documents: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision_requested'],
        default: 'pending',
        index: true
    },
    reviewNote: {
        type: String,
        trim: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Bileşik index: öğrenci + durum sorguları için
activitySchema.index({ student: 1, status: 1 });
activitySchema.index({ school: 1, status: 1 });

module.exports = mongoose.model('Activity', activitySchema);
