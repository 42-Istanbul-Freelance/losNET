const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    level: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        required: true
    },
    totalHoursAtGrant: {
        type: Number,
        required: true
    },
    grantedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Bir öğrenci aynı seviye sertifikayı bir kez alabilir
certificateSchema.index({ student: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
