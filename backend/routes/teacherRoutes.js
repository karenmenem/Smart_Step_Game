const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const teacherAuth = require('../middleware/teacherAuth');
const { query } = require('../config/database');
const {
    registerTeacher,
    loginTeacher,
    getTeacherProfile,
    getTeacherContent,
    createQuestion,
    createPassage
} = require('../controllers/teacherController');
const { sendMessage, getMessages } = require('../controllers/messageController');

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

// Message routes
router.post('/messages', teacherAuth, (req, res, next) => {
    req.userType = 'teacher';
    next();
}, sendMessage);
router.get('/messages', teacherAuth, (req, res, next) => {
    req.userType = 'teacher';
    req.userId = req.teacherId;
    next();
}, getMessages);

// Get all activities for question creation
router.get('/activities', teacherAuth, async (req, res) => {
    try {
        const activities = await query(`
            SELECT a.activity_id, a.name, sec.level, s.name as subject_name, sec.name as section_name
            FROM activity a
            JOIN section sec ON a.section_id = sec.section_id
            JOIN subject s ON sec.subject_id = s.subject_id
            ORDER BY s.name, sec.level, a.name
        `);
        res.json({ activities });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// Get reading passages for comprehension questions
router.get('/reading-passages', teacherAuth, async (req, res) => {
    try {
        const passages = await query(`
            SELECT passage_id as id, title, content as passage_text, level, sublevel, topic
            FROM reading_passage
            ORDER BY level, sublevel, title
        `);
        res.json({ passages });
    } catch (error) {
        console.error('Error fetching passages:', error);
        res.status(500).json({ error: 'Failed to fetch passages' });
    }
});

module.exports = router;
