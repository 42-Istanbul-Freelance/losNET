const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || path.join(__dirname, 'serviceAccountKey.json');

try {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: serviceAccount.project_id + '.appspot.com'
    });

    console.log('Firebase Admin SDK başlatıldı');
} catch (error) {
    console.warn('Firebase Admin SDK başlatılamadı:', error.message);
    console.warn('Firebase Auth ve Storage özellikleri devre dışı olacak.');
}

module.exports = admin;
