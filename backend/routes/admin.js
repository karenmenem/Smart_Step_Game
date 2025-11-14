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
  getDashboardStats,
  getHomepageSettings,
  updateHomepageSetting,
  bulkUpdateHomepageSettings,
  resetHomepageSettings
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
    
    const admins = await query('SELECT * FROM admin WHERE username = ?', [username]);
    
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
          email: admin.email
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

// ==================== READING PASSAGES CRUD ====================
router.get('/reading-passages', adminAuth, async (req, res) => {
  try {
    const passages = await query(`
      SELECT 
        passage_id as id,
        subject,
        topic,
        level,
        sublevel,
        title,
        author,
        content,
        difficulty,
        created_at
      FROM reading_passage
      ORDER BY subject, topic, level, sublevel
    `);
    
    res.json({
      success: true,
      data: passages
    });
  } catch (error) {
    console.error('Get reading passages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reading passages'
    });
  }
});

router.post('/reading-passages', adminAuth, async (req, res) => {
  try {
    const { subject, topic, level, sublevel, title, author, content } = req.body;
    
    if (!subject || !topic || !level || !sublevel || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject, topic, level, sublevel, title, and content are required'
      });
    }
    
    const result = await query(`
      INSERT INTO reading_passage (subject, topic, level, sublevel, title, author, content)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [subject, topic, level, sublevel, title, author || null, content]);
    
    res.json({
      success: true,
      message: 'Reading passage created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create reading passage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reading passage'
    });
  }
});

router.put('/reading-passages/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, topic, level, sublevel, title, author, content } = req.body;
    
    if (!subject || !topic || !level || !sublevel || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject, topic, level, sublevel, title, and content are required'
      });
    }
    
    await query(`
      UPDATE reading_passage 
      SET subject = ?, topic = ?, level = ?, sublevel = ?, title = ?, author = ?, content = ?
      WHERE passage_id = ?
    `, [subject, topic, level, sublevel, title, author || null, content, id]);
    
    res.json({
      success: true,
      message: 'Reading passage updated successfully'
    });
  } catch (error) {
    console.error('Update reading passage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reading passage'
    });
  }
});

router.delete('/reading-passages/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Attempting to delete reading passage with ID:', id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid passage ID'
      });
    }
    
    // Check if passage exists first
    const existing = await query('SELECT passage_id FROM reading_passage WHERE passage_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading passage not found'
      });
    }
    
    const result = await query('DELETE FROM reading_passage WHERE passage_id = ?', [id]);
    console.log('Delete result:', result);
    
    res.json({
      success: true,
      message: 'Reading passage deleted successfully'
    });
  } catch (error) {
    console.error('Delete reading passage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reading passage: ' + error.message
    });
  }
});

// ==================== PASSAGE-QUESTIONS ENDPOINTS ====================

// Get questions for a specific passage
router.get('/passage-questions/:passageId', adminAuth, async (req, res) => {
  try {
    const { passageId } = req.params;
    
    const questions = await query(`
      SELECT q.*, rp.title as passage_title, rp.author as passage_author
      FROM Question q
      LEFT JOIN reading_passages rp ON q.reading_passage_id = rp.id
      WHERE q.reading_passage_id = ?
      ORDER BY q.id ASC
    `, [passageId]);
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Get passage questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get passage questions: ' + error.message
    });
  }
});

// Get all questions (with or without passages)
router.get('/all-questions', adminAuth, async (req, res) => {
  try {
    const questions = await query(`
      SELECT q.*, rp.title as passage_title, rp.author as passage_author
      FROM Question q
      LEFT JOIN reading_passages rp ON q.reading_passage_id = rp.id
      ORDER BY q.reading_passage_id, q.id ASC
    `);
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Get all questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions: ' + error.message
    });
  }
});

// Create new question
router.post('/questions', adminAuth, async (req, res) => {
  try {
    const {
      subject, topic, level, sublevel, text,
      option_a, option_b, option_c, option_d,
      correct_answer, reading_passage_id
    } = req.body;

    // Validate required fields
    if (!text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return res.status(400).json({
        success: false,
        message: 'All question fields are required'
      });
    }

    // Validate correct answer
    if (!['A', 'B', 'C', 'D'].includes(correct_answer)) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer must be A, B, C, or D'
      });
    }

    // If reading_passage_id is provided, check if it exists
    if (reading_passage_id) {
      const passageExists = await query('SELECT id FROM reading_passages WHERE id = ?', [reading_passage_id]);
      if (passageExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Reading passage not found'
        });
      }
    }

    const result = await query(`
      INSERT INTO Question (
        subject, topic, level, sublevel, text,
        option_a, option_b, option_c, option_d,
        correct_answer, reading_passage_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      subject || 'English',
      topic || 'comprehension',
      level || 'easy',
      sublevel || '1',
      text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      reading_passage_id || null
    ]);

    res.json({
      success: true,
      data: {
        id: result.insertId,
        subject, topic, level, sublevel, text,
        option_a, option_b, option_c, option_d,
        correct_answer, reading_passage_id
      },
      message: 'Question created successfully'
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question: ' + error.message
    });
  }
});

// Update question
router.put('/questions/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subject, topic, level, sublevel, text,
      option_a, option_b, option_c, option_d,
      correct_answer, reading_passage_id
    } = req.body;

    // Check if question exists
    const existing = await query('SELECT id FROM Question WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Validate required fields
    if (!text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return res.status(400).json({
        success: false,
        message: 'All question fields are required'
      });
    }

    // Validate correct answer
    if (!['A', 'B', 'C', 'D'].includes(correct_answer)) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer must be A, B, C, or D'
      });
    }

    // If reading_passage_id is provided, check if it exists
    if (reading_passage_id) {
      const passageExists = await query('SELECT id FROM reading_passages WHERE id = ?', [reading_passage_id]);
      if (passageExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Reading passage not found'
        });
      }
    }

    await query(`
      UPDATE Question SET
        subject = ?, topic = ?, level = ?, sublevel = ?, text = ?,
        option_a = ?, option_b = ?, option_c = ?, option_d = ?,
        correct_answer = ?, reading_passage_id = ?
      WHERE id = ?
    `, [
      subject, topic, level, sublevel, text,
      option_a, option_b, option_c, option_d,
      correct_answer, reading_passage_id || null, id
    ]);

    res.json({
      success: true,
      message: 'Question updated successfully'
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question: ' + error.message
    });
  }
});

// Delete question
router.delete('/questions/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if question exists
    const existing = await query('SELECT id FROM Question WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await query('DELETE FROM Question WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question: ' + error.message
    });
  }
});

// ==================== HOMEPAGE SETTINGS ====================

// Get all homepage settings
router.get('/homepage-settings', adminAuth, getHomepageSettings);

// Update single homepage setting
router.put('/homepage-settings/:id', adminAuth, updateHomepageSetting);

// Bulk update homepage settings
router.post('/homepage-settings/bulk-update', adminAuth, bulkUpdateHomepageSettings);

// Reset homepage settings to defaults
router.post('/homepage-settings/reset', adminAuth, resetHomepageSettings);

module.exports = router;
