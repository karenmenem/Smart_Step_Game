const express = require('express');
const router = express.Router();
const { getChildAchievements } = require('../controllers/achievementController');

// Get all achievements for a child (earned and available)
router.get('/child/:childId', getChildAchievements);

module.exports = router;
