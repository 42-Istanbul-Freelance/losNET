const fs = require('fs');
const multer = require('multer');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.bin';
        const safeName = Date.now() + '-' + Math.random().toString(36).slice(2) + ext;
        cb(null, safeName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Desteklenmeyen dosya türü. İzin verilen: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX'), false);
        }
    }
});

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Dosya seçilmedi' });
        }
        const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
        const url = `${baseUrl}/uploads/${req.file.filename}`;
        res.json({ url, fileName: req.file.originalname });
    } catch (error) {
        res.status(500).json({ message: 'Oluşturulamadı', error: error.message });
    }
};

exports.uploadMiddleware = upload.single('file');
