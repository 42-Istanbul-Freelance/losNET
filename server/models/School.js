const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        trim: true
    },
    badge: {
        type: String,
        enum: ['none', 'inci_dostu', 'etki_lideri', 'yilin_okulu'],
        default: 'none'
    },
    totalStudents: {
        type: Number,
        default: 0
    },
    totalHours: {
        type: Number,
        default: 0
    },
    targetHours: {
        type: Number,
        default: 40,
        enum: [30, 40]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('School', schoolSchema);
