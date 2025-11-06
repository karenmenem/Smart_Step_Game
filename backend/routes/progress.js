const express = require('express');
const router = express.Router();
const {
  checkLevelAccess,
  saveQuizProgress,
  getChildProgress
} = require('../controllers/progressController');

// Check if child can access a level
router.get('/check-access/:childId/:activityId', checkLevelAccess);

// Save quiz results
router.post('/save', saveQuizProgress);

// Get all progress for a child
router.get('/child/:childId', getChildProgress);

module.exports = router;
