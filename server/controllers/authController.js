const User = require('../models/User');
const School = require('../models/School');

// Yeni kullanıcı kaydı (Firebase kayıt sonrası profil oluşturma)
exports.register = async (req, res) => {
    try {
        const { name, email, phone, tcKimlik, role, schoolName, city, district, grade, coordinatorTeacher } = req.body;

        // Zaten kayıtlı mı kontrol et
        const existingUser = await User.findOne({ firebaseUid: req.firebaseUser.uid });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu kullanıcı zaten kayıtlı' });
        }

        // Okul bul veya oluştur
        let school = null;
        if (schoolName && city) {
            school = await School.findOne({ name: schoolName, city });
            if (!school) {
                school = await School.create({ name: schoolName, city, district });
            }
            // Öğrenci ise okul öğrenci sayısını artır
            if (role === 'student') {
                school.totalStudents += 1;
                await school.save();
            }
        }

        const user = await User.create({
            firebaseUid: req.firebaseUser.uid,
            name,
            email: email || req.firebaseUser.email,
            phone,
            tcKimlik,
            role: role || 'student',
            school: school ? school._id : undefined,
            city,
            district,
            grade,
            coordinatorTeacher
        });

        const populatedUser = await User.findById(user._id).populate('school');
        res.status(201).json(populatedUser);
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu', error: error.message });
    }
};

// Giriş yapan kullanıcının profilini getir
exports.getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ message: 'Profil bulunamadı', needsRegistration: true });
        }
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'Profil alınırken hata oluştu', error: error.message });
    }
};

// Profil güncelleme
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, tcKimlik, city, district, grade, coordinatorTeacher, profilePhoto } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (tcKimlik) updateData.tcKimlik = tcKimlik;
        if (city) updateData.city = city;
        if (district) updateData.district = district;
        if (grade) updateData.grade = grade;
        if (coordinatorTeacher) updateData.coordinatorTeacher = coordinatorTeacher;
        if (profilePhoto) updateData.profilePhoto = profilePhoto;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).populate('school');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Profil güncellenirken hata oluştu', error: error.message });
    }
};
