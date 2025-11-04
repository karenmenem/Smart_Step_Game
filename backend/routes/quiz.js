const express = require('express');
const router = express.Router();
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

// Save quiz attempt and progress
router.post('/attempt', saveQuizAttempt);

// Get child's progress
router.get('/progress/:childId', getChildProgress);

// Get child's achievements
router.get('/achievements/:childId', getChildAchievements);

module.exports = router;
