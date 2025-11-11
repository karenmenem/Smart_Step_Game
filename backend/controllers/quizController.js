const { query } = require('../config/database');

// Get questions for a specific activity
const getQuestions = async (req, res) => {
  try {
    const { activityId } = req.params;
    
    const questions = await query(
      `SELECT 
        question_id as id,
        question_text as question,
        question_type as type,
        correct_answer as correct,
        options,
        asl_signs as aslSigns,
        asl_video_url as aslVideoUrl,
        asl_type as aslType,
        explanation,
        difficulty_level as difficulty,
        points_value as points
      FROM question 
      WHERE activity_id = ? 
      ORDER BY order_index ASC`,
      [activityId]
    );
 
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options || '[]'),
      aslSigns: JSON.parse(q.aslSigns || '[]')
    }));
    
    res.json({
      success: true,
      data: parsedQuestions
    });
    
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions'
    });
  }
};

const getActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    
    const activities = await query(
      `SELECT 
        a.activity_id as id,
        a.name,
        a.description,
        a.activity_type as type,
        a.points_value as points,
        s.level,
        s.name as levelName,
        sub.name as subject
      FROM activity a
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      WHERE a.activity_id = ?`,
      [activityId]
    );
    
    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      data: activities[0]
    });
    
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity'
    });
  }
};

const saveQuizAttempt = async (req, res) => {
  try {
    const { childId, activityId, score, maxScore, answers } = req.body;
    
    if (!childId || !activityId) {
      return res.status(400).json({
        success: false,
        message: 'Child ID and Activity ID are required'
      });
    }
    
    const passed = (score / maxScore) >= 0.8; 
    
    await query(
      `INSERT INTO child_progress 
        (child_id, activity_id, score, max_score, completed, attempts, last_attempt, completed_at) 
        VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?)
      ON DUPLICATE KEY UPDATE
        score = GREATEST(score, VALUES(score)),
        max_score = VALUES(max_score),
        attempts = attempts + 1,
        completed = VALUES(completed),
        last_attempt = CURRENT_TIMESTAMP,
        completed_at = CASE 
          WHEN VALUES(completed) = 1 AND completed = 0 THEN CURRENT_TIMESTAMP 
          ELSE completed_at 
        END`,
      [childId, activityId, score, maxScore, passed, passed ? new Date() : null]
    );
    
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        await query(
          `INSERT INTO attempt 
          (child_id, question_id, selected_answer, is_correct, points_earned, time_taken) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            childId, 
            answer.questionId, 
            answer.selectedAnswer, 
            answer.isCorrect ? 1 : 0, 
            answer.pointsEarned || 0,
            answer.timeTaken || null
          ]
        );
      }
    }
    
    const activity = await query('SELECT points_value FROM activity WHERE activity_id = ?', [activityId]);
    if (activity.length > 0 && passed) {
      await query(
        'UPDATE child SET total_points = total_points + ? WHERE child_id = ?',
        [activity[0].points_value, childId]
      );
    }
  
    await checkAchievements(childId);
    
    res.json({
      success: true,
      message: passed ? 'Quiz completed successfully!' : 'Quiz attempt saved',
      data: {
        passed,
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100)
      }
    });
    
  } catch (error) {
    console.error('Save quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save quiz attempt'
    });
  }
};

const getChildProgress = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const progress = await query(
      `SELECT 
        cp.activity_id as activityId,
        cp.completed,
        cp.score,
        cp.max_score as maxScore,
        cp.attempts,
        cp.last_attempt as lastAttempt,
        cp.completed_at as completedAt,
        a.name as activityName,
        a.activity_type as activityType,
        s.level,
        sub.name as subject
      FROM child_progress cp
      JOIN activity a ON cp.activity_id = a.activity_id
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      WHERE cp.child_id = ?
      ORDER BY s.level, a.order_index`,
      [childId]
    );
    
    res.json({
      success: true,
      data: progress
    });
    
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress'
    });
  }
};

const getChildAchievements = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const achievements = await query(
      `SELECT 
        a.achievement_id as id,
        a.name,
        a.description,
        a.icon,
        a.points_required as pointsRequired,
        a.level_required as levelRequired,
        ca.earned_at as earnedAt,
        CASE WHEN ca.child_id IS NOT NULL THEN 1 ELSE 0 END as earned
      FROM achievement a
      LEFT JOIN child_achievement ca ON a.achievement_id = ca.achievement_id AND ca.child_id = ?
      ORDER BY a.level_required, a.points_required`,
      [childId]
    );
    
    res.json({
      success: true,
      data: achievements
    });
    
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
};

const checkAchievements = async (childId) => {
  try {
 
    const childStats = await query(
      `SELECT 
        c.total_points,
        c.current_math_level,
        c.current_english_level,
        COUNT(DISTINCT cp.activity_id) as completed_activities,
        COUNT(DISTINCT CASE WHEN DATE(cp.completed_at) = CURDATE() THEN cp.activity_id END) as today_completions
      FROM child c
      LEFT JOIN child_progress cp ON c.child_id = cp.child_id AND cp.completed = 1
      WHERE c.child_id = ?
      GROUP BY c.child_id`,
      [childId]
    );
    
    if (childStats.length === 0) return;
    
    const stats = childStats[0];
    
    const achievementsToAward = [];
    
    if (stats.completed_activities >= 1) {
      achievementsToAward.push(1);
    }

    if (stats.today_completions >= 5) {
      achievementsToAward.push(2);
    }
    
    const mathLevel1 = await query(
      `SELECT COUNT(*) as total, 
        SUM(cp.completed) as completed
      FROM activity a
      JOIN section s ON a.section_id = s.section_id
      LEFT JOIN child_progress cp ON a.activity_id = cp.activity_id AND cp.child_id = ?
      WHERE s.subject_id = 1 AND s.level = 1`,
      [childId]
    );
    if (mathLevel1[0].completed >= mathLevel1[0].total && mathLevel1[0].total > 0) {
      achievementsToAward.push(3);
    }
   
    for (const achievementId of achievementsToAward) {
      await query(
        'INSERT IGNORE INTO child_achievement (child_id, achievement_id) VALUES (?, ?)',
        [childId, achievementId]
      );
    }
    
  } catch (error) {
    console.error('Check achievements error:', error);
  }
};

const getActivitiesByLevel = async (req, res) => {
  try {
    const { subject, level } = req.params;
    
    const activities = await query(
      `SELECT 
        a.activity_id as id,
        a.name,
        a.description,
        a.activity_type as type,
        a.points_value as points,
        s.level,
        s.name as levelName
      FROM activity a
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      WHERE LOWER(sub.name) = LOWER(?) AND s.level = ?
      ORDER BY a.order_index`,
      [subject, level]
    );
    
    res.json({
      success: true,
      data: activities
    });
    
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

module.exports = {
  getQuestions,
  getActivity,
  saveQuizAttempt,
  getChildProgress,
  getChildAchievements,
  getActivitiesByLevel
};
