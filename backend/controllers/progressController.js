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
    const isLevel1 = [7, 16, 25, 34].includes(parseInt(activityId)); // Addition, Subtraction, Multiplication, Division Level 1
    
    if (isLevel1) {
      return res.json({
        success: true,
        allowed: true,
        reason: 'Level 1 is always accessible'
      });
    }
    
    // For Level 2 or 3, check previous level completion
    let requiredActivityId;
    
    // Determine which previous level needs to be completed
    if ([8, 17, 26, 35].includes(parseInt(activityId))) {
      // Level 2 - requires Level 1
      requiredActivityId = parseInt(activityId) - 1;
    } else if ([9, 18, 27, 36].includes(parseInt(activityId))) {
      // Level 3 - requires Level 2
      requiredActivityId = parseInt(activityId) - 1;
    }
    
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
