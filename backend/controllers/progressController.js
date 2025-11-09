const { query } = require('../config/database');
const { checkAndAwardAchievements, updateChildPoints } = require('./achievementController');

/**
 * Check if a child can access a specific activity level
 * Returns: { allowed: boolean, reason: string, progress: object }
 */
const checkLevelAccess = async (req, res) => {
  try {
    const { childId, activityId } = req.params;
    
    // First, check if the child has ever attempted this activity
    // If they have, it means it was unlocked before and should stay unlocked
    const hasAttempted = await query(
      'SELECT * FROM child_progress WHERE child_id = ? AND activity_id = ?',
      [childId, activityId]
    );
    
    if (hasAttempted && hasAttempted.length > 0) {
      return res.json({
        success: true,
        allowed: true,
        reason: 'Level previously unlocked',
        hasProgress: true
      });
    }
    
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
    // Beginner Level 1: 7 (addition), 16 (subtraction), 25 (multiplication), 34 (division), 43 (comprehension)
    const isLevel1 = [7, 16, 25, 34, 43].includes(parseInt(activityId));
    
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
      41: 40,
      
      // English Comprehension: Beginner (43, 44), Intermediate (45, 46), Advanced (47, 48)
      44: 43, // Beginner L2 requires Beginner L1
      45: 44, // Intermediate L1 requires Beginner L2
      46: 45, // Intermediate L2 requires Intermediate L1
      47: 46, // Advanced L1 requires Intermediate L2
      48: 47  // Advanced L2 requires Advanced L1
    };
    
    requiredActivityId = activityMap[parseInt(activityId)];
    
    // Special logic for English: Intermediate L1 and Advanced L1 require BOTH previous sublevels
    // Intermediate L1 (45) requires both Beginner L1 (43) AND L2 (44)
    // Advanced L1 (47) requires both Intermediate L1 (45) AND L2 (46)
    const requiresBothSublevels = [45, 47]; // English Intermediate L1 and Advanced L1
    
    if (requiresBothSublevels.includes(parseInt(activityId))) {
      let requiredActivities = [];
      if (parseInt(activityId) === 45) {
        // Intermediate L1 requires both Beginner sublevels
        requiredActivities = [43, 44];
      } else if (parseInt(activityId) === 47) {
        // Advanced L1 requires both Intermediate sublevels
        requiredActivities = [45, 46];
      }
      
      // Check both required activities
      for (const reqActivityId of requiredActivities) {
        const progress = await query(`
          SELECT * FROM child_progress 
          WHERE child_id = ? AND activity_id = ?
          ORDER BY last_attempt DESC
          LIMIT 1
        `, [childId, reqActivityId]);
        
        if (!progress || progress.length === 0) {
          return res.json({
            success: true,
            allowed: false,
            reason: 'Complete both previous sublevels first',
            requiredLevel: reqActivityId
          });
        }
        
        const lastProgress = progress[0];
        const percentage = (lastProgress.score / lastProgress.max_score) * 100;
        
        if (percentage < 80) {
          return res.json({
            success: true,
            allowed: false,
            reason: 'You need 80% or higher in both previous sublevels',
            progress: Math.round(percentage)
          });
        }
      }
      
      // Both sublevels completed with 80%+
      return res.json({
        success: true,
        allowed: true,
        reason: 'Level unlocked!'
      });
    }
    
    // Standard logic for other levels (single prerequisite)
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
