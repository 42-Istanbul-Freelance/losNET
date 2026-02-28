const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    tcKimlik: {
        type: String,
        trim: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    },
    city: {
        type: String,
        trim: true
    },
    district: {
        type: String,
        trim: true
    },
    grade: {
        type: String,
        trim: true
    },
    coordinatorTeacher: {
        type: String,
        trim: true
    },
    totalHours: {
        type: Number,
        default: 0
    },
    badgeLevel: {
        type: String,
        enum: ['none', 'bronze', 'silver', 'gold', 'platinum'],
        default: 'none'
    },
    profilePhoto: {
        type: String
    },
    parentConsent: {
        type: Boolean,
        default: false
    },
    parentConsentAt: {
        type: Date
    },
    parentConsentToken: {
        type: String,
        sparse: true
    },
    parentConsentTokenExpires: {
        type: Date
    }
}, {
    timestamps: true
});

// Rozet seviyesini saate göre hesapla
userSchema.methods.calculateBadge = function () {
    if (this.totalHours >= 200) return 'platinum';
    if (this.totalHours >= 100) return 'gold';
    if (this.totalHours >= 50) return 'silver';
    if (this.totalHours >= 25) return 'bronze';
    return 'none';
};

module.exports = mongoose.model('User', userSchema);
