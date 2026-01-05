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

// Get all subjects with sections (public endpoint for students)
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await query(`
      SELECT 
        s.subject_id,
        s.name,
        s.description,
        COUNT(DISTINCT sec.section_id) as section_count,
        COUNT(DISTINCT a.activity_id) as activity_count
      FROM subject s
      LEFT JOIN section sec ON s.subject_id = sec.subject_id
      LEFT JOIN activity a ON sec.section_id = a.section_id
      GROUP BY s.subject_id, s.name, s.description
      ORDER BY s.name
    `);
    
    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subjects'
    });
  }
});

// Get sections for a specific subject (public endpoint for students)
router.get('/subjects/:subjectId/sections', async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const sections = await query(`
      SELECT 
        sec.section_id,
        sec.subject_id,
        sec.level,
        sec.name,
        sec.description,
        sec.order_index,
        COUNT(a.activity_id) as activity_count
      FROM section sec
      LEFT JOIN activity a ON sec.section_id = a.section_id
      WHERE sec.subject_id = ?
      GROUP BY sec.section_id
      ORDER BY sec.level, sec.order_index
    `, [subjectId]);
    
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sections'
    });
  }
});

// Get activities for a specific section (public endpoint for students)
router.get('/sections/:sectionId/activities', async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const activities = await query(`
      SELECT 
        a.activity_id,
        a.section_id,
        a.name,
        a.description,
        a.activity_type,
        a.points_value,
        a.order_index,
        COUNT(q.question_id) as question_count
      FROM activity a
      LEFT JOIN question q ON a.activity_id = q.activity_id
      WHERE a.section_id = ?
      GROUP BY a.activity_id
      ORDER BY a.order_index
    `, [sectionId]);
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities'
    });
  }
});

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
      WHERE subject = ? AND topic = ? AND level = ? AND sublevel = ? AND is_active = 1
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
