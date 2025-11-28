const express = require('express');
const router = express.Router();
const { getChildAchievements } = require('../controllers/achievementController');


router.get('/child/:childId', getChildAchievements);

module.exports = router;
