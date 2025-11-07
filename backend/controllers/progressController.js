const { query } = require('../config/database');
const { checkAndAwardAchievements, updateChildPoints } = require('./achievementController');

/**
 * Check if a child can access a specific activity level
 * Returns: { allowed: boolean, reason: string, progress: object }
 */
const checkLevelAccess = async (req, res) => {
  try {
    const { childId, activityId } = req.params;
    
    // Get activity info
    const activity = await query(
      'SELECT * FROM Activity WHERE activity_id = ?',
      [activityId]
    );
    
    if (!activity || activity.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    const currentActivity = activity[0];
    
    // Check if this is Level 1 (always accessible)
    // Beginner Level 1: 7 (addition), 16 (subtraction), 25 (multiplication), 34 (division)
    const isLevel1 = [7, 16, 25, 34].includes(parseInt(activityId));
    
    if (isLevel1) {
      return res.json({
        success: true,
        allowed: true,
        reason: 'Level 1 is always accessible'
      });
    }
    
    // For other levels, check previous level completion
    let requiredActivityId;
    
    // Map activity IDs to required previous activity
    const activityMap = {
      // Addition: Beginner (7, 8), Intermediate (10, 11), Advanced (13, 14)
      8: 7,   // Beginner L2 requires Beginner L1
      10: 8,  // Intermediate L1 requires Beginner L2
      11: 10, // Intermediate L2 requires Intermediate L1
      13: 11, // Advanced L1 requires Intermediate L2
      14: 13, // Advanced L2 requires Advanced L1
      
      // Subtraction: Beginner (16, 17), Intermediate (19, 20), Advanced (22, 23)
      17: 16,
      19: 17,
      20: 19,
      22: 20,
      23: 22,
      
      // Multiplication: Beginner (25, 26), Intermediate (28, 29), Advanced (31, 32)
      26: 25,
      28: 26,
      29: 28,
      31: 29,
      32: 31,
      
      // Division: Beginner (34, 35), Intermediate (37, 38), Advanced (40, 41)
      35: 34,
      37: 35,
      38: 37,
      40: 38,
      41: 40
    };
    
    requiredActivityId = activityMap[parseInt(activityId)];
    
    // Get progress for required level
    const progress = await query(`
      SELECT * FROM child_progress 
      WHERE child_id = ? AND activity_id = ?
      ORDER BY last_attempt DESC
      LIMIT 1
    `, [childId, requiredActivityId]);
    
    if (!progress || progress.length === 0) {
      return res.json({
        success: true,
        allowed: false,
        reason: 'Complete previous level first',
        requiredLevel: requiredActivityId
      });
    }
    
    const lastProgress = progress[0];
    const percentage = (lastProgress.score / lastProgress.max_score) * 100;
    
    // Check if scored 80% or higher
    if (percentage >= 80) {
      return res.json({
        success: true,
        allowed: true,
        reason: 'Previous level completed with 80%+',
        progress: {
          score: lastProgress.score,
          maxScore: lastProgress.max_score,
          percentage: Math.round(percentage)
        }
      });
    } else {
      return res.json({
        success: true,
        allowed: false,
        reason: `Need 80% or higher on previous level (you got ${Math.round(percentage)}%)`,
        progress: {
          score: lastProgress.score,
          maxScore: lastProgress.max_score,
          percentage: Math.round(percentage)
        },
        requiredLevel: requiredActivityId
      });
    }
    
  } catch (error) {
    console.error('Check level access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check level access',
      error: error.message
    });
  }
};

/**
 * Save quiz results and update progress
 */
const saveQuizProgress = async (req, res) => {
  try {
    const { childId, activityId, score, maxScore } = req.body;
    
    if (!childId || !activityId || score === undefined || !maxScore) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const percentage = (score / maxScore) * 100;
    const completed = percentage >= 80;
    
    // Check if progress record exists
    const existing = await query(
      'SELECT * FROM child_progress WHERE child_id = ? AND activity_id = ?',
      [childId, activityId]
    );
    
    if (existing && existing.length > 0) {
      // Update existing record
      await query(`
        UPDATE child_progress 
        SET score = ?, 
            max_score = ?, 
            completed = ?,
            attempts = attempts + 1,
            last_attempt = NOW(),
            completed_at = ${completed ? 'NOW()' : 'completed_at'}
        WHERE child_id = ? AND activity_id = ?
      `, [score, maxScore, completed ? 1 : 0, childId, activityId]);
    } else {
      // Create new record
      await query(`
        INSERT INTO child_progress 
        (child_id, activity_id, score, max_score, completed, attempts, last_attempt, completed_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), ${completed ? 'NOW()' : 'NULL'})
      `, [childId, activityId, score, maxScore, completed ? 1 : 0]);
    }
    
    // Award points - 10 points per correct answer
    const pointsEarned = score * 10;
    const newTotalPoints = await updateChildPoints(childId, pointsEarned);
    
    // Check and award achievements
    const newAchievements = await checkAndAwardAchievements(childId, activityId, score, maxScore);
    
    res.json({
      success: true,
      message: 'Progress saved',
      completed,
      percentage: Math.round(percentage),
      pointsEarned,
      totalPoints: newTotalPoints,
      newAchievements
    });
    
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save progress',
      error: error.message
    });
  }
};

/**
 * Get all progress for a child
 */
const getChildProgress = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const progress = await query(`
      SELECT cp.*, a.name as activity_name 
      FROM child_progress cp
      JOIN Activity a ON cp.activity_id = a.activity_id
      WHERE cp.child_id = ?
      ORDER BY cp.activity_id
    `, [childId]);
    
    res.json({
      success: true,
      data: progress
    });
    
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress',
      error: error.message
    });
  }
};

module.exports = {
  checkLevelAccess,
  saveQuizProgress,
  getChildProgress
};
