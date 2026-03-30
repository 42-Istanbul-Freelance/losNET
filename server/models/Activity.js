const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        sparse: true
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
    isPrivate: {
        type: Boolean,
        default: false
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
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    creatorRole: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        required: true
    },
    participantStudents: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        participationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'invited'],
            default: 'pending'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: {
            type: Date
        },
        rejectionReason: {
            type: String
        }
    }]
}, {
    timestamps: true
});

// Bileşik index: öğrenci + durum sorguları için
activitySchema.index({ student: 1, status: 1 });
activitySchema.index({ school: 1, status: 1 });
activitySchema.index({ createdBy: 1, creatorRole: 1 });
activitySchema.index({ 'participantStudents.student': 1, 'participantStudents.participationStatus': 1 });

module.exports = mongoose.model('Activity', activitySchema);
