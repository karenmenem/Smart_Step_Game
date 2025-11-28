const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const teacherAuth = require('../middleware/teacherAuth');
const {
    registerTeacher,
    loginTeacher,
    getTeacherProfile,
    getTeacherContent,
    createQuestion,
    createPassage
} = require('../controllers/teacherController');

// Configure multer for certificate uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/certificates/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cert-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png) and PDFs are allowed'));
        }
    }
});

// Public routes
router.post('/register', upload.single('certificate'), registerTeacher);
router.post('/login', loginTeacher);

// Protected routes (require authentication)
router.get('/profile', teacherAuth, getTeacherProfile);
router.get('/content', teacherAuth, getTeacherContent);
router.post('/questions', teacherAuth, createQuestion);
router.post('/passages', teacherAuth, createPassage);

module.exports = router;
