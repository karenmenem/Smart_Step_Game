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
    
    // Level 1 activities are always accessible (Beginner - Level 1)
    const isLevel1 = [7, 16, 25, 34, 43, 61, 70].includes(parseInt(activityId));
    
    if (isLevel1) {
      return res.json({
        success: true,
        allowed: true,
        reason: 'Level 1 is always accessible'
      });
    }
    
    let requiredActivityId;
    
    const activityMap = {
      // Addition
      8: 7,
      10: 8, 
      11: 10,
      13: 11,
      14: 13,
      
      // Subtraction
      17: 16,
      19: 17,
      20: 19,
      22: 20,
      23: 22,

      // Multiplication
      71: 70,
      73: 71,
      74: 73,
      76: 74,
      77: 76,

      // Vocabulary
      26: 25,
      28: 26,
      29: 28,
      31: 29,
      32: 31,
   
      // Grammar
      62: 61,
      64: 62,
      65: 64,
      67: 65,
      68: 67,
    
      // Comprehension
      44: 43,
      46: 44,
      47: 46,
      49: 47,
      50: 49 
    };
    
    requiredActivityId = activityMap[parseInt(activityId)];
    const requiresBothSublevels = [46, 49, 64, 67];
    
    if (requiresBothSublevels.includes(parseInt(activityId))) {
      let requiredActivities = [];
      if (parseInt(activityId) === 46) {
        requiredActivities = [43, 44]; // Comprehension
      } else if (parseInt(activityId) === 49) {
        requiredActivities = [46, 47]; // Comprehension
      } else if (parseInt(activityId) === 64) {
        requiredActivities = [61, 62]; // Grammar
      } else if (parseInt(activityId) === 67) {
        requiredActivities = [64, 65]; // Grammar
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
    
    // Check and update child level if they completed a level
    if (completed) {
      await updateChildLevel(childId, activityId);
    }
    
    // Update minutes played and streak
    await updateChildActivity(childId);
    
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
    
    // Get progress data
    const progress = await query(`
      SELECT cp.*, a.name as activity_name, s.name as subject_name
      FROM child_progress cp
      JOIN activity a ON cp.activity_id = a.activity_id
      JOIN section s ON a.section_id = s.section_id
      WHERE cp.child_id = ?
      ORDER BY cp.last_attempt DESC
    `, [childId]);
    
    // Calculate percentage for each progress entry
    const progressWithPercentage = progress.map(p => ({
      ...p,
      percentage: p.max_score > 0 ? Math.round((p.score / p.max_score) * 100) : 0
    }));
    
    // Get child stats
    const childStats = await query(`
      SELECT minutes_played, day_streak, last_activity_date
      FROM child
      WHERE child_id = ?
    `, [childId]);
    
    res.json({
      success: true,
      data: progressWithPercentage,
      stats: childStats[0] || { minutes_played: 0, day_streak: 0, last_activity_date: null }
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

const updateChildLevel = async (childId, activityId) => {
  try {
    // Get activity details to determine subject
    const [activities] = await query(`
      SELECT a.*, s.subject_id, sub.name as subject_name, s.level
      FROM activity a
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      WHERE a.activity_id = ?
    `, [activityId]);
    
    if (activities.length === 0) return;
    
    const activity = activities[0];
    const subjectId = activity.subject_id;
    const currentLevel = activity.level;
    const subjectName = activity.subject_name.toLowerCase();
    
    // Check if all activities in current level are completed
    const [levelActivities] = await query(`
      SELECT a.activity_id
      FROM activity a
      JOIN section s ON a.section_id = s.section_id
      WHERE s.subject_id = ? AND s.level = ?
    `, [subjectId, currentLevel]);
    
    const activityIds = levelActivities.map(a => a.activity_id);
    
    // Get completed activities for this level
    const [completedActivities] = await query(`
      SELECT activity_id
      FROM child_progress
      WHERE child_id = ? AND activity_id IN (?) AND completed = 1
    `, [childId, activityIds]);
    
    // If all activities in this level are completed, update child level
    if (completedActivities.length === levelActivities.length) {
      const newLevel = currentLevel + 1;
      
      if (subjectName === 'math' || subjectName === 'mathematics') {
        await query(`
          UPDATE child 
          SET current_math_level = ?
          WHERE child_id = ? AND current_math_level < ?
        `, [newLevel, childId, newLevel]);
        console.log(`Updated child ${childId} math level to ${newLevel}`);
      } else if (subjectName === 'english') {
        await query(`
          UPDATE child 
          SET current_english_level = ?
          WHERE child_id = ? AND current_english_level < ?
        `, [newLevel, childId, newLevel]);
        console.log(`Updated child ${childId} english level to ${newLevel}`);
      }
    }
  } catch (error) {
    console.error('Error updating child level:', error);
  }
};

const updateChildActivity = async (childId) => {
  try {
    const [child] = await query('SELECT last_activity_date, day_streak FROM child WHERE child_id = ?', [childId]);
    
    if (child.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastDate = child[0].last_activity_date;
    let newStreak = child[0].day_streak || 0;
    
    if (lastDate) {
      const lastActivityDate = new Date(lastDate).toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActivityDate === yesterdayStr) {
        // Consecutive day - increment streak
        newStreak += 1;
      } else if (lastActivityDate !== today) {
        // Streak broken - reset to 1
        newStreak = 1;
      }
      // If same day, keep current streak
    } else {
      // First activity ever
      newStreak = 1;
    }
    
    // Update child with new streak and add 5 minutes (average quiz time)
    await query(`
      UPDATE child 
      SET minutes_played = minutes_played + 5,
          day_streak = ?,
          last_activity_date = ?
      WHERE child_id = ?
    `, [newStreak, today, childId]);
    
  } catch (error) {
    console.error('Error updating child activity:', error);
  }
};

module.exports = {
  checkLevelAccess,
  saveQuizProgress,
  getChildProgress
};
