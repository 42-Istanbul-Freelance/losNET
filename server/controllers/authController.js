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
            coordinatorTeacher,
            registrationStatus: role === 'admin' ? 'approved' : 'pending'
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

// Onay bekleyen kayıtları listele (öğretmen/admin)
exports.getPendingRegistrations = async (req, res) => {
    try {
        const query = { registrationStatus: 'pending' };

        // Öğretmenler sadece öğrenci onaylarını görebilir
        if (req.user.role === 'teacher') {
            query.role = 'student';
        }
        // Admin hem öğrenci hem öğretmen onaylarını görebilir

        const pending = await User.find(query).populate('school', 'name city');

        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Onay bekleyen kayıtlar alınırken hata oluştu', error: error.message });
    }
};

// Öğrenci kaydını onayla (öğretmen/admin)
exports.approveStudent = async (req, res) => {
    try {
        const { userId } = req.params;

        const student = await User.findById(userId);
        if (!student) {
            return res.status(404).json({ message: 'Öğrenci bulunamadı' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'Bu endpoint sadece öğrenci onayı içindir' });
        }

        if (student.registrationStatus !== 'pending') {
            return res.status(400).json({ message: 'Bu kaydın durumu zaten işlenmişti' });
        }

        student.registrationStatus = 'approved';
        student.approvedBy = req.user._id;
        student.approvedAt = new Date();
        await student.save();

        res.json({
            message: 'Öğrenci kaydı onaylandı',
            student: student
        });
    } catch (error) {
        res.status(500).json({ message: 'Öğrenci onaylanırken hata oluştu', error: error.message });
    }
};

// Öğrenci kaydını reddet (öğretmen/admin)
exports.rejectStudent = async (req, res) => {
    try {
        const { userId } = req.params;
        const { rejectionReason } = req.body;

        const student = await User.findById(userId);
        if (!student) {
            return res.status(404).json({ message: 'Öğrenci bulunamadı' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'Bu endpoint sadece öğrenci reddi içindir' });
        }

        if (student.registrationStatus !== 'pending') {
            return res.status(400).json({ message: 'Bu kaydın durumu zaten işlenmişti' });
        }

        student.registrationStatus = 'rejected';
        student.approvedBy = req.user._id;
        student.approvedAt = new Date();
        student.rejectionReason = rejectionReason || '';
        await student.save();

        res.json({
            message: 'Öğrenci kaydı reddedildi',
            student: student
        });
    } catch (error) {
        res.status(500).json({ message: 'Öğrenci reddedilirken hata oluştu', error: error.message });
    }
};

// Öğretmen kaydını onayla (SADECE admin)
exports.approveTeacher = async (req, res) => {
    try {
        const { userId } = req.params;

        const teacher = await User.findById(userId);
        if (!teacher) {
            return res.status(404).json({ message: 'Öğretmen bulunamadı' });
        }

        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'Bu endpoint sadece öğretmen onayı içindir' });
        }

        if (teacher.registrationStatus !== 'pending') {
            return res.status(400).json({ message: 'Bu kaydın durumu zaten işlenmişti' });
        }

        teacher.registrationStatus = 'approved';
        teacher.approvedBy = req.user._id;
        teacher.approvedAt = new Date();
        await teacher.save();

        res.json({
            message: 'Öğretmen kaydı onaylandı',
            teacher: teacher
        });
    } catch (error) {
        res.status(500).json({ message: 'Öğretmen onaylanırken hata oluştu', error: error.message });
    }
};

// Öğretmen kaydını reddet (SADECE admin)
exports.rejectTeacher = async (req, res) => {
    try {
        const { userId } = req.params;
        const { rejectionReason } = req.body;

        const teacher = await User.findById(userId);
        if (!teacher) {
            return res.status(404).json({ message: 'Öğretmen bulunamadı' });
        }

        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'Bu endpoint sadece öğretmen reddi içindir' });
        }

        if (teacher.registrationStatus !== 'pending') {
            return res.status(400).json({ message: 'Bu kaydın durumu zaten işlenmişti' });
        }

        teacher.registrationStatus = 'rejected';
        teacher.approvedBy = req.user._id;
        teacher.approvedAt = new Date();
        teacher.rejectionReason = rejectionReason || '';
        await teacher.save();

        res.json({
            message: 'Öğretmen kaydı reddedildi',
            teacher: teacher
        });
    } catch (error) {
        res.status(500).json({ message: 'Öğretmen reddedilirken hata oluştu', error: error.message });
    }
};