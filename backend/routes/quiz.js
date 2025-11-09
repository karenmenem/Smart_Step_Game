const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const {
  getQuestions,
  getActivity,
  saveQuizAttempt,
  getChildProgress,
  getChildAchievements,
  getActivitiesByLevel
} = require('../controllers/quizController');

// Get questions for a specific activity
router.get('/questions/:activityId', getQuestions);

// Get activity details
router.get('/activity/:activityId', getActivity);

// Get activities by subject and level
router.get('/activities/:subject/:level', getActivitiesByLevel);

// Get reading passage for a specific subject, topic, level, and sublevel
router.get('/reading-passage/:subject/:topic/:level/:sublevel', async (req, res) => {
  try {
    const { subject, topic, level, sublevel } = req.params;
    
    const sqlQuery = `
      SELECT 
        passage_id as id,
        subject,
        topic,
        level,
        sublevel,
        title,
        author,
        content
      FROM reading_passage
      WHERE subject = ? AND topic = ? AND level = ? AND sublevel = ?
    `;
    
    const passages = await query(sqlQuery, [subject, topic, parseInt(level), parseInt(sublevel)]);
    
    res.json({
      success: true,
      data: passages.length > 0 ? passages[0] : null
    });
  } catch (error) {
    console.error('Get reading passage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reading passage'
    });
  }
});

// Save quiz attempt and progress
router.post('/attempt', saveQuizAttempt);

// Get child's progress
router.get('/progress/:childId', getChildProgress);

// Get child's achievements
router.get('/achievements/:childId', getChildAchievements);

module.exports = router;
