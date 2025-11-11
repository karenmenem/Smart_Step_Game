const { query } = require('../config/database');
const { checkAndAwardAchievements, updateChildPoints } = require('./achievementController');

const checkLevelAccess = async (req, res) => {
  try {
    const { childId, activityId } = req.params;
    
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
    
    const isLevel1 = [7, 16, 25, 34, 43].includes(parseInt(activityId));
    
    if (isLevel1) {
      return res.json({
        success: true,
        allowed: true,
        reason: 'Level 1 is always accessible'
      });
    }
    
    let requiredActivityId;
    
    const activityMap = {
      8: 7,
      10: 8, 
      11: 10,
      13: 11,
      14: 13,
      
      17: 16,
      19: 17,
      20: 19,
      22: 20,
      23: 22,

      26: 25,
      28: 26,
      29: 28,
      31: 29,
      32: 31,
   
      35: 34,
      37: 35,
      38: 37,
      40: 38,
      41: 40,
    
      44: 43,
      46: 44,
      47: 46,
      49: 47,
      50: 49 
    };
    
    requiredActivityId = activityMap[parseInt(activityId)];
    const requiresBothSublevels = [46, 49];
    
    if (requiresBothSublevels.includes(parseInt(activityId))) {
      let requiredActivities = [];
      if (parseInt(activityId) === 46) {
        requiredActivities = [43, 44];
      } else if (parseInt(activityId) === 49) {
        requiredActivities = [46, 47];
      }
      
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
      
      return res.json({
        success: true,
        allowed: true,
        reason: 'Level unlocked!'
      });
    }
    
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
    
    const existing = await query(
      'SELECT * FROM child_progress WHERE child_id = ? AND activity_id = ?',
      [childId, activityId]
    );
    
    if (existing && existing.length > 0) {
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
      await query(`
        INSERT INTO child_progress 
        (child_id, activity_id, score, max_score, completed, attempts, last_attempt, completed_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), ${completed ? 'NOW()' : 'NULL'})
      `, [childId, activityId, score, maxScore, completed ? 1 : 0]);
    }
    
    const pointsEarned = score * 10;
    const newTotalPoints = await updateChildPoints(childId, pointsEarned);
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
