const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { query } = require('../config/database');
const { adminAuth } = require('../middleware/adminAuth');
const {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getAllAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getDashboardStats
} = require('../controllers/adminController');

// ==================== ADMIN AUTH ====================

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    const admins = await query('SELECT * FROM admin WHERE username = ? AND is_active = TRUE', [username]);
    
    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const admin = admins[0];
    const isValid = await bcrypt.compare(password, admin.password);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    await query('UPDATE admin SET last_login = CURRENT_TIMESTAMP WHERE admin_id = ?', [admin.admin_id]);
    
    // Generate token
    const token = jwt.sign(
      {
        adminId: admin.admin_id,
        username: admin.username,
        email: admin.email
      },
      process.env.JWT_SECRET || 'smartstep-secret-key-2024',
      { expiresIn: '8h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin.admin_id,
          username: admin.username,
          email: admin.email,
          fullName: admin.full_name
        }
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Verify admin token
router.get('/verify', adminAuth, (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

// ==================== DASHBOARD ====================
router.get('/dashboard/stats', adminAuth, getDashboardStats);

// ==================== QUESTIONS CRUD ====================
router.get('/questions', adminAuth, getAllQuestions);
router.get('/questions/:questionId', adminAuth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const questions = await query(`
      SELECT q.*, 
             a.name as activity_name,
             s.name as subject_name,
             sec.level
      FROM Question q
      LEFT JOIN Activity a ON q.activity_id = a.activity_id
      LEFT JOIN Section sec ON a.section_id = sec.section_id
      LEFT JOIN Subject s ON sec.subject_id = s.subject_id
      WHERE q.question_id = ?
    `, [questionId]);
    
    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.json({
      success: true,
      data: questions[0]
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get question'
    });
  }
});
router.post('/questions', adminAuth, createQuestion);
router.put('/questions/:questionId', adminAuth, updateQuestion);
router.delete('/questions/:questionId', adminAuth, deleteQuestion);

// ==================== SUBJECTS CRUD ====================
router.get('/subjects', adminAuth, getAllSubjects);
router.post('/subjects', adminAuth, createSubject);
router.put('/subjects/:subjectId', adminAuth, updateSubject);
router.delete('/subjects/:subjectId', adminAuth, deleteSubject);

// ==================== SECTIONS (LEVELS) CRUD ====================
router.get('/sections', adminAuth, getAllSections);
router.post('/sections', adminAuth, createSection);
router.put('/sections/:sectionId', adminAuth, updateSection);
router.delete('/sections/:sectionId', adminAuth, deleteSection);

// ==================== ACTIVITIES CRUD ====================
router.get('/activities', adminAuth, getAllActivities);
router.post('/activities', adminAuth, createActivity);
router.put('/activities/:activityId', adminAuth, updateActivity);
router.delete('/activities/:activityId', adminAuth, deleteActivity);

// ==================== ACHIEVEMENTS CRUD ====================
router.get('/achievements', adminAuth, getAllAchievements);
router.post('/achievements', adminAuth, createAchievement);
router.put('/achievements/:achievementId', adminAuth, updateAchievement);
router.delete('/achievements/:achievementId', adminAuth, deleteAchievement);

module.exports = router;
