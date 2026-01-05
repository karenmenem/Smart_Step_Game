const { query } = require('../config/database');


const checkAndAwardAchievements = async (childId, activityId, score, maxScore) => {
  try {
    const percentage = (score / maxScore) * 100;
    const newAchievements = [];
    
    
    const childProgress = await query(`
      SELECT COUNT(*) as completed_count,
             SUM(score) as total_points
      FROM child_progress 
      WHERE child_id = ? AND completed = 1
    `, [childId]);
    
    const stats = childProgress[0];
    const completedCount = stats.completed_count || 0;
    const totalPoints = stats.total_points || 0;
    
    
    if (completedCount === 1) {
      await awardAchievement(childId, 1, 'Completed first activity!');
      newAchievements.push({ id: 1, name: 'First Steps' });
    }
    
    
    const today = new Date().toISOString().split('T')[0];
    const todayCount = await query(`
      SELECT COUNT(*) as count 
      FROM child_progress 
      WHERE child_id = ? 
      AND DATE(last_attempt) = ? 
      AND completed = 1
    `, [childId, today]);
    
    if (todayCount[0].count >= 5) {
      const hasAchievement = await query(
        'SELECT * FROM child_achievement WHERE child_id = ? AND achievement_id = ?',
        [childId, 2]
      );
      if (hasAchievement.length === 0) {
        await awardAchievement(childId, 2, 'Completed 5 activities today!');
        newAchievements.push({ id: 2, name: 'Quick Learner' });
      }
    }
    
    
    const mathLevel1 = await query(`
      SELECT COUNT(*) as count 
      FROM child_progress 
      WHERE child_id = ? 
      AND activity_id IN (7, 16, 25, 34) 
      AND completed = 1
    `, [childId]);
    
    if (mathLevel1[0].count >= 4) {
      const hasAchievement = await query(
        'SELECT * FROM child_achievement WHERE child_id = ? AND achievement_id = ?',
        [childId, 3]
      );
      if (hasAchievement.length === 0) {
        await awardAchievement(childId, 3, 'Completed all Level 1 math!');
        newAchievements.push({ id: 3, name: 'Math Wizard' });
      }
    }
    
    
    const attempts = await query(`
      SELECT attempts 
      FROM child_progress 
      WHERE child_id = ? AND activity_id = ?
    `, [childId, activityId]);
    
    if (attempts[0]?.attempts >= 3 && percentage >= 80) {
      const hasAchievement = await query(
        'SELECT * FROM child_achievement WHERE child_id = ? AND achievement_id = ?',
        [childId, 5]
      );
      if (hasAchievement.length === 0) {
        await awardAchievement(childId, 5, 'Never gave up!');
        newAchievements.push({ id: 5, name: 'Persistent' });
      }
    }
    
    
    if (percentage === 100) {
     
      const perfectAchievement = await query(
        'SELECT * FROM achievement WHERE name = ?',
        ['Perfect Score']
      );
      
      if (perfectAchievement.length > 0) {
        const hasAchievement = await query(
          'SELECT * FROM child_achievement WHERE child_id = ? AND achievement_id = ?',
          [childId, perfectAchievement[0].achievement_id]
        );
        if (hasAchievement.length === 0) {
          await awardAchievement(childId, perfectAchievement[0].achievement_id, 'Got 100%!');
          newAchievements.push({ id: perfectAchievement[0].achievement_id, name: 'Perfect Score' });
        }
      }
    }
    
    return newAchievements;
    
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};


const awardAchievement = async (childId, achievementId, earnedFor) => {
  try {
    
    const existing = await query(
      'SELECT * FROM child_achievement WHERE child_id = ? AND achievement_id = ?',
      [childId, achievementId]
    );
    
    if (existing.length > 0) {
      return false; // Already has it
    }
    
    // Award the achievement
    await query(
      'INSERT INTO child_achievement (child_id, achievement_id, earned_at) VALUES (?, ?, NOW())',
      [childId, achievementId]
    );
    
    console.log(`🏆 Achievement awarded! Child ${childId} earned achievement ${achievementId}`);
    return true;
    
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return false;
  }
};


const getChildAchievements = async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Get child's total points
    const childData = await query(
      'SELECT total_points FROM child WHERE child_id = ?',
      [childId]
    );
    const totalPoints = childData[0]?.total_points || 0;
    
    
    const earned = await query(`
      SELECT a.*, ca.earned_at
      FROM child_achievement ca
      JOIN achievement a ON ca.achievement_id = a.achievement_id
      WHERE ca.child_id = ?
      ORDER BY ca.earned_at DESC
    `, [childId]);
    
    
    const all = await query('SELECT * FROM achievement ORDER BY achievement_id');
    
   
    const achievements = all.map(a => {
      const earnedData = earned.find(e => e.achievement_id === a.achievement_id);
      return {
        ...a,
        earned: !!earnedData,
        earnedAt: earnedData?.earned_at || null
      };
    });
    
    res.json({
      success: true,
      data: {
        achievements,
        totalEarned: earned.length,
        totalAvailable: all.length,
        totalPoints: totalPoints
      }
    });
    
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements'
    });
  }
};


const updateChildPoints = async (childId, pointsToAdd) => {
  try {
    await query(
      'UPDATE child SET total_points = total_points + ? WHERE child_id = ?',
      [pointsToAdd, childId]
    );
    
   
    const result = await query(
      'SELECT total_points FROM child WHERE child_id = ?',
      [childId]
    );
    
    return result[0]?.total_points || 0;
    
  } catch (error) {
    console.error('Error updating points:', error);
    return 0;
  }
};

module.exports = {
  checkAndAwardAchievements,
  awardAchievement,
  getChildAchievements,
  updateChildPoints
};
