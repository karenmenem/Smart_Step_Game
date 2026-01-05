const { query } = require('../config/database');


const getAllQuestions = async (req, res) => {
  try {
    const { activityId, subject, level } = req.query;
    
    let sql = `
      SELECT 
        q.*,
        a.name as activity_name,
        s.name as section_name,
        s.level,
        sub.name as subject_name
      FROM question q
      JOIN activity a ON q.activity_id = a.activity_id
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      WHERE q.is_active = 1
    `;
    const params = [];
    
    if (activityId) {
      sql += ' AND q.activity_id = ?';
      params.push(activityId);
    }
    if (subject) {
      sql += ' AND LOWER(sub.name) = LOWER(?)';
      params.push(subject);
    }
    if (level) {
      sql += ' AND s.level = ?';
      params.push(level);
    }
    
    sql += ' ORDER BY sub.name, s.level, a.order_index, q.order_index';
    
    const questions = await query(sql, params);
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
};


const createQuestion = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const {
      activity_id,
      activityId,
      question_text,
      questionText,
      question_type,
      questionType,
      correct_answer,
      correctAnswer,
      options,
      asl_signs,
      aslSigns,
      asl_video_url,
      aslVideoUrl,
      asl_type,
      aslType,
      explanation,
      difficulty_level,
      difficultyLevel,
      points_value,
      pointsValue,
      order_index,
      orderIndex
    } = req.body;
    
    
    const actId = activity_id || activityId || req.body['activity_id'] || req.body['activityId'];
    const qText = question_text || questionText || req.body['question_text'] || req.body['questionText'];
    const qType = question_type || questionType || req.body['question_type'] || req.body['questionType'];
    const correctAns = correct_answer || correctAnswer || req.body['correct_answer'] || req.body['correctAnswer'];
    const aslS = asl_signs || aslSigns || req.body['asl_signs'] || req.body['aslSigns'];
    const aslVid = asl_video_url || aslVideoUrl || req.body['asl_video_url'] || req.body['aslVideoUrl'];
    const aslImg = req.body.asl_image_url || req.body.aslImageUrl || req.body['asl_image_url'] || req.body['aslImageUrl'];
    const aslT = asl_type || aslType || req.body['asl_type'] || req.body['aslType'] || 'none';
    const diffLevel = difficulty_level || difficultyLevel || req.body['difficulty_level'] || req.body['difficultyLevel'] || 1;
    const ptsValue = points_value || pointsValue || req.body['points_value'] || req.body['pointsValue'] || 10;
    const ordIdx = order_index || orderIndex || req.body['order_index'] || req.body['orderIndex'] || 1;
    
    console.log('=== CREATE QUESTION DEBUG ===');
    console.log('Parsed values:', { actId, qText, qType, correctAns });
    console.log('Activity ID check:', actId, 'truthy?', !!actId, 'type:', typeof actId);
    console.log('Question text check:', qText, 'truthy?', !!qText, 'type:', typeof qText);
    console.log('Question type check:', qType, 'truthy?', !!qType, 'type:', typeof qType);
    console.log('Correct answer check:', correctAns, 'truthy?', !!correctAns, 'type:', typeof correctAns);
    
    // More lenient validation - check if values are truthy
    if (!actId || !qText || !qType || !correctAns) {
      console.log('❌ VALIDATION FAILED');
      return res.status(400).json({
        success: false,
        message: 'Activity ID, question text, type, and correct answer are required',
        debug: { 
          actId, 
          qText, 
          qType, 
          correctAns, 
          receivedBody: req.body,
          allKeys: Object.keys(req.body)
        }
      });
    }
    
    console.log('✅ VALIDATION PASSED');
    
    
    let optionsData = options;
    if (typeof options === 'string') {
      try {
        optionsData = JSON.parse(options);
      } catch (e) {
        optionsData = options;
      }
    }
    
    
    let aslSignsData = aslS;
    if (typeof aslS === 'string' && aslS.trim()) {
      try {
        aslSignsData = JSON.parse(aslS);
      } catch (e) {
        aslSignsData = aslS;
      }
    }
    
    const passageId = req.body.passage_id || req.body.passageId || null;
    
    const result = await query(
      `INSERT INTO question 
      (activity_id, passage_id, question_text, question_type, correct_answer, options, asl_signs, 
       asl_video_url, asl_image_url, asl_type, explanation, difficulty_level, points_value, order_index) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actId,
        passageId,
        qText,
        qType,
        correctAns,
        typeof optionsData === 'string' ? optionsData : JSON.stringify(optionsData || []),
        typeof aslSignsData === 'string' ? aslSignsData : JSON.stringify(aslSignsData || []),
        aslVid || null,
        aslImg || null,
        aslT,
        explanation || null,
        diffLevel,
        ptsValue,
        ordIdx
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { questionId: result.insertId }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ success: false, message: 'Failed to create question', error: error.message });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    console.log('\n=== UPDATE QUESTION DEBUG ===');
    console.log('Question ID:', req.params.questionId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('is_active value:', req.body.is_active, 'type:', typeof req.body.is_active);
    
    const { questionId } = req.params;
    const {
      activity_id,
      activityId,
      question_text,
      questionText,
      question_type,
      questionType,
      correct_answer,
      correctAnswer,
      options,
      asl_signs,
      aslSigns,
      asl_video_url,
      aslVideoUrl,
      asl_type,
      aslType,
      explanation,
      difficulty_level,
      difficultyLevel,
      points_value,
      pointsValue,
      order_index,
      orderIndex
    } = req.body;
    
    const actId = activity_id || activityId;
    const qText = question_text || questionText;
    const qType = question_type || questionType;
    const correctAns = correct_answer || correctAnswer;
    const aslS = asl_signs || aslSigns;
    const aslVid = asl_video_url || aslVideoUrl;
    const aslT = asl_type || aslType;
    const diffLevel = difficulty_level || difficultyLevel;
    const ptsValue = points_value || pointsValue;
    const ordIdx = order_index || orderIndex;
    
    console.log('Parsed values:');
    console.log('  Activity ID:', actId);
    console.log('  Question Text:', qText?.substring(0, 50));
    console.log('  Question Type:', qType);
    console.log('  Correct Answer:', correctAns);
    
    // Parse options if it's a string
    let optionsData = options;
    if (typeof options === 'string' && options.trim()) {
      try {
        optionsData = JSON.parse(options);
      } catch (e) {
        console.error('Failed to parse options:', e.message);
        optionsData = options;
      }
    }
    
    // Parse ASL signs if it's a string
    let aslSignsData = aslS;
    if (typeof aslS === 'string' && aslS.trim()) {
      try {
        aslSignsData = JSON.parse(aslS);
        console.log('Parsed ASL signs successfully:', aslSignsData);
      } catch (e) {
        console.error('Failed to parse ASL signs:', e.message, 'Raw value:', aslS);
        aslSignsData = aslS;
      }
    }
    console.log('ASL signs data type:', typeof aslSignsData, 'Value:', aslSignsData);
    
    const aslImg = req.body.asl_image_url || req.body.aslImageUrl || req.body['asl_image_url'] || req.body['aslImageUrl'];
    const passageId = req.body.passage_id || req.body.passageId || null;
    
    console.log('Executing UPDATE query...');
    
    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value) => {
      if (value === '' || value === undefined) return null;
      return value;
    };
    
    // Convert undefined/empty strings to null for all parameters
    const params = [
      toNullIfEmpty(actId),
      toNullIfEmpty(passageId),
      toNullIfEmpty(qText),
      toNullIfEmpty(qType),
      toNullIfEmpty(correctAns),
      optionsData ? (typeof optionsData === 'string' ? optionsData : JSON.stringify(optionsData)) : null,
      aslSignsData ? (typeof aslSignsData === 'string' ? aslSignsData : JSON.stringify(aslSignsData)) : null,
      toNullIfEmpty(aslVid),
      toNullIfEmpty(aslImg),
      toNullIfEmpty(aslT),
      toNullIfEmpty(explanation),
      toNullIfEmpty(diffLevel),
      toNullIfEmpty(ptsValue),
      toNullIfEmpty(ordIdx)
    ];
    
    console.log('Query parameters:', params.map((p, i) => `${i}: ${p === null ? 'NULL' : typeof p === 'string' ? p.substring(0, 30) + '...' : p}`));
    
    const isActiveValue = req.body.is_active ? 1 : 0;
    console.log('is_active to save:', isActiveValue);
    
    try {
      const result = await query(
        `UPDATE question SET 
          activity_id = COALESCE(?, activity_id),
          passage_id = COALESCE(?, passage_id),
          question_text = COALESCE(?, question_text),
          question_type = COALESCE(?, question_type),
          correct_answer = COALESCE(?, correct_answer),
          options = COALESCE(?, options),
          asl_signs = COALESCE(?, asl_signs),
          asl_video_url = COALESCE(?, asl_video_url),
          asl_image_url = COALESCE(?, asl_image_url),
          asl_type = COALESCE(?, asl_type),
          explanation = COALESCE(?, explanation),
          difficulty_level = COALESCE(?, difficulty_level),
          points_value = COALESCE(?, points_value),
          order_index = COALESCE(?, order_index),
          is_active = ?
        WHERE question_id = ?`,
        [...params, isActiveValue, questionId]
      );
      
      console.log('Update result:', result);
      console.log('Affected rows:', result.affectedRows);
    } catch (updateError) {
      console.error('SQL UPDATE ERROR:', updateError.message);
      console.error('SQL State:', updateError.sqlState);
      console.error('SQL Message:', updateError.sqlMessage);
      throw updateError;
    }
    console.log('=== UPDATE COMPLETE ===\n');
    
    res.json({
      success: true,
      message: 'Question updated successfully'
    });
  } catch (error) {
    console.error('\n=== UPDATE QUESTION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Question ID:', req.params.questionId);
    console.error('=== ERROR END ===\n');
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update question', 
      error: error.message,
      details: error.stack
    });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    await query('DELETE FROM Question WHERE question_id = ?', [questionId]);
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete question', error: error.message });
  }
};

// ==================== SUBJECTS MANAGEMENT ====================

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await query('SELECT * FROM subject ORDER BY name');
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
};

// Create subject
const createSubject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }
    
    const result = await query(
      'INSERT INTO subject (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { subjectId: result.insertId }
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ success: false, message: 'Failed to create subject' });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { name, description } = req.body;
    
    await query(
      'UPDATE subject SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE subject_id = ?',
      [name, description, subjectId]
    );
    
    res.json({ success: true, message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ success: false, message: 'Failed to update subject' });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    await query('DELETE FROM subject WHERE subject_id = ?', [subjectId]);
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subject' });
  }
};

// ==================== SECTIONS (LEVELS) MANAGEMENT ====================

// Get all sections
const getAllSections = async (req, res) => {
  try {
    const sections = await query(`
      SELECT s.*, sub.name as subject_name 
      FROM section s
      JOIN subject sub ON s.subject_id = sub.subject_id
      ORDER BY sub.name, s.level
    `);
    res.json({ success: true, data: sections });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sections' });
  }
};

// Create section
const createSection = async (req, res) => {
  try {
    const { subjectId, level, name, description, orderIndex } = req.body;
    
    if (!subjectId || !level || !name) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID, level, and name are required'
      });
    }
    
    const result = await query(
      'INSERT INTO section (subject_id, level, name, description, order_index) VALUES (?, ?, ?, ?, ?)',
      [subjectId, level, name, description || null, orderIndex || 0]
    );
    
    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: { sectionId: result.insertId }
    });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ success: false, message: 'Failed to create section' });
  }
};

// Update section
const updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { level, name, description, orderIndex } = req.body;
    
    await query(
      `UPDATE section SET 
        level = COALESCE(?, level),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        order_index = COALESCE(?, order_index)
      WHERE section_id = ?`,
      [level, name, description, orderIndex, sectionId]
    );
    
    res.json({ success: true, message: 'Section updated successfully' });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ success: false, message: 'Failed to update section' });
  }
};

// Delete section
const deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    await query('DELETE FROM section WHERE section_id = ?', [sectionId]);
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete section' });
  }
};

// ==================== ACTIVITIES MANAGEMENT ====================

// Get all activities
const getAllActivities = async (req, res) => {
  try {
    const activities = await query(`
      SELECT a.*, s.name as section_name, s.level, sub.name as subject_name 
      FROM activity a
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      ORDER BY sub.name, s.level, a.order_index
    `);
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
};

// Create activity
const createActivity = async (req, res) => {
  try {
    const { sectionId, name, description, activityType, pointsValue, orderIndex } = req.body;
    
    if (!sectionId || !name || !activityType) {
      return res.status(400).json({
        success: false,
        message: 'Section ID, name, and activity type are required'
      });
    }
    
    const result = await query(
      'INSERT INTO activity (section_id, name, description, activity_type, points_value, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      [sectionId, name, description || null, activityType, pointsValue || 100, orderIndex || 0]
    );
    
    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { activityId: result.insertId }
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to create activity' });
  }
};

// Update activity
const updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { sectionId, name, description, activityType, pointsValue, orderIndex } = req.body;
    
    console.log('Update activity - ID:', activityId, 'Body:', req.body);
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    
    if (sectionId !== undefined) {
      updates.push('section_id = ?');
      values.push(sectionId);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (activityType !== undefined) {
      updates.push('activity_type = ?');
      values.push(activityType);
    }
    if (pointsValue !== undefined) {
      updates.push('points_value = ?');
      values.push(pointsValue);
    }
    if (orderIndex !== undefined) {
      updates.push('order_index = ?');
      values.push(orderIndex);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    values.push(activityId);
    
    const result = await query(
      `UPDATE activity SET ${updates.join(', ')} WHERE activity_id = ?`,
      values
    );
    
    console.log('Update result:', result);
    res.json({ success: true, message: 'Activity updated successfully' });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to update activity', error: error.message });
  }
};

// Delete activity
const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    await query('DELETE FROM activity WHERE activity_id = ?', [activityId]);
    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete activity' });
  }
};

// ==================== ACHIEVEMENTS MANAGEMENT ====================

// Get all achievements
const getAllAchievements = async (req, res) => {
  try {
    const achievements = await query('SELECT * FROM achievement ORDER BY level_required, points_required');
    res.json({ success: true, data: achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch achievements' });
  }
};

// Create achievement
const createAchievement = async (req, res) => {
  try {
    const { name, description, icon, pointsRequired, levelRequired } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Achievement name is required' });
    }
    
    const result = await query(
      'INSERT INTO achievement (name, description, icon, points_required, level_required) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, icon || '🏆', pointsRequired || 0, levelRequired || 1]
    );
    
    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: { achievementId: result.insertId }
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({ success: false, message: 'Failed to create achievement' });
  }
};

// Update achievement
const updateAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const { name, description, icon, pointsRequired, levelRequired } = req.body;
    
    await query(
      `UPDATE achievement SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        points_required = COALESCE(?, points_required),
        level_required = COALESCE(?, level_required)
      WHERE achievement_id = ?`,
      [name, description, icon, pointsRequired, levelRequired, achievementId]
    );
    
    res.json({ success: true, message: 'Achievement updated successfully' });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({ success: false, message: 'Failed to update achievement' });
  }
};

// Delete achievement
const deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    await query('DELETE FROM achievement WHERE achievement_id = ?', [achievementId]);
    res.json({ success: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete achievement' });
  }
};

// ==================== DASHBOARD STATS ====================

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalQuestions,
      totalActivities,
      totalSections,
      totalSubjects,
      totalChildren,
      totalAchievements
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM question'),
      query('SELECT COUNT(*) as count FROM activity'),
      query('SELECT COUNT(*) as count FROM section'),
      query('SELECT COUNT(*) as count FROM subject'),
      query('SELECT COUNT(*) as count FROM child'),
      query('SELECT COUNT(*) as count FROM achievement')
    ]);
    
    res.json({
      success: true,
      data: {
        questions: totalQuestions[0].count,
        activities: totalActivities[0].count,
        sections: totalSections[0].count,
        subjects: totalSubjects[0].count,
        children: totalChildren[0].count,
        achievements: totalAchievements[0].count
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

// Homepage Settings Management
const getHomepageSettings = async (req, res) => {
  try {
    const settings = await query('SELECT * FROM homepage_settings ORDER BY category, setting_key');
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        settings,
        grouped: groupedSettings
      }
    });
  } catch (error) {
    console.error('Get homepage settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch homepage settings' });
  }
};

const updateHomepageSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { setting_value } = req.body;
    const adminId = req.admin.adminId || req.admin.admin_id;
    
    await query(
      'UPDATE homepage_settings SET setting_value = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
      [setting_value, adminId, id]
    );
    
    const updated = await query('SELECT * FROM homepage_settings WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Homepage setting updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update homepage setting error:', error);
    res.status(500).json({ success: false, message: 'Failed to update homepage setting' });
  }
};

const bulkUpdateHomepageSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Array of {id, setting_value}
    const adminId = req.admin.adminId || req.admin.admin_id;
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Settings must be an array' });
    }
    
    // Update all settings in a transaction
    for (const setting of settings) {
      await query(
        'UPDATE homepage_settings SET setting_value = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
        [setting.setting_value, adminId, setting.id]
      );
    }
    
    const updated = await query('SELECT * FROM homepage_settings ORDER BY category, setting_key');
    
    res.json({
      success: true,
      message: 'Homepage settings updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Bulk update homepage settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update homepage settings' });
  }
};

const resetHomepageSettings = async (req, res) => {
  try {
    const adminId = req.admin.adminId || req.admin.admin_id;
    
    // Reset to default values by re-running the default inserts
    const defaultSettings = [
      ['header_background_color', '#ffffff'],
      ['header_text_color', '#333333'],
      ['logo_text', 'SmartStep'],
      ['logo_accent_text', 'Step'],
      ['logo_accent_color', '#ff6b6b'],
      ['main_title', 'Make Learning Fun<br/>with Smart Step!'],
      ['main_subtitle', 'Let\'s learn with words, numbers, and signs!'],
      ['primary_button_bg', '#4CAF50'],
      ['secondary_button_bg', '#2196F3'],
    ];
    
    for (const [key, value] of defaultSettings) {
      await query(
        'UPDATE homepage_settings SET setting_value = ?, updated_by = ?, updated_at = NOW() WHERE setting_key = ?',
        [value, adminId, key]
      );
    }
    
    const updated = await query('SELECT * FROM homepage_settings ORDER BY category, setting_key');
    
    res.json({
      success: true,
      message: 'Homepage settings reset to defaults',
      data: updated
    });
  } catch (error) {
    console.error('Reset homepage settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset homepage settings' });
  }
};



// pending for approval
const getPendingTeachers = async (req, res) => {
  try {
    const teachers = await query(
      'SELECT id, name, email, certificate_path, created_at FROM teachers WHERE status = ?',
      ['pending']
    );
    
    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error('Get pending teachers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending teachers' });
  }
};

// Get all teachers (any status)
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await query(
      'SELECT id, name, email, status, certificate_path, created_at, approved_at FROM teachers ORDER BY created_at DESC'
    );
    
    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error('Get all teachers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
  }
};


const approveTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    await query(
      'UPDATE teachers SET status = ? WHERE id = ?',
      ['approved', teacherId]
    );
    
    // Get teacher info for notification
    const teachers = await query('SELECT name, email FROM teachers WHERE id = ?', [teacherId]);
    const teacher = teachers[0];
    
    // Create a default class for the teacher
    const generateClassCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    let classCode = generateClassCode();
    let exists = await query('SELECT id FROM teacher_classes WHERE class_code = ?', [classCode]);
    
    while (exists && exists.length > 0) {
      classCode = generateClassCode();
      exists = await query('SELECT id FROM teacher_classes WHERE class_code = ?', [classCode]);
    }
    
    await query(
      `INSERT INTO teacher_classes (teacher_id, class_name, class_code, description, is_active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [teacherId, `${teacher.name}'s Class`, classCode, 'My main class']
    );
    
    // Create notification for teacher
    await query(
      `INSERT INTO notifications (user_id, user_type, notification_type, title, message) 
       VALUES (?, 'teacher', 'approval', ?, ?)`,
      [
        teacherId,
        'Account Approved',
        'Your teacher account has been approved! You can now add questions and passages.'
      ]
    );
    
    res.json({ 
      success: true, 
      message: `Teacher ${teacher.name} approved successfully` 
    });
  } catch (error) {
    console.error('Approve teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve teacher' });
  }
};

// Reject teacher
const rejectTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { reason } = req.body;
    
    await query(
      'UPDATE teachers SET status = ?, rejection_reason = ? WHERE id = ?',
      ['rejected', reason || 'No reason provided', teacherId]
    );
    
    // Get teacher info
    const [teachers] = await query('SELECT name FROM teachers WHERE id = ?', [teacherId]);
    const teacher = teachers[0];
    
    // Create notification for teacher
    await query(
      `INSERT INTO notifications (user_id, user_type, notification_type, title, message) 
       VALUES (?, 'teacher', 'content_rejected', ?, ?)`,
      [
        teacherId,
        'Account Rejected',
        `Your teacher account was not approved. Reason: ${reason || 'No reason provided'}`
      ]
    );
    
    res.json({ 
      success: true, 
      message: `Teacher ${teacher.name} rejected` 
    });
  } catch (error) {
    console.error('Reject teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject teacher' });
  }
};


const getPendingContent = async (req, res) => {
  try {
    const content = await query(`
      SELECT 
        tc.*,
        t.name as teacher_name,
        t.email as teacher_email,
        CASE 
          WHEN tc.content_type = 'question' THEN q.question_text
          WHEN tc.content_type = 'passage' THEN rp.content
        END as content_preview,
        CASE 
          WHEN tc.content_type = 'question' THEN q.asl_signs
          WHEN tc.content_type = 'passage' THEN NULL
        END as asl_required,
        CASE 
          WHEN tc.content_type = 'question' THEN q.asl_type
          WHEN tc.content_type = 'passage' THEN NULL
        END as asl_type
      FROM teacher_content tc
      JOIN teachers t ON tc.teacher_id = t.id
      LEFT JOIN question q ON tc.content_type = 'question' AND tc.content_id = q.question_id
      LEFT JOIN reading_passage rp ON tc.content_type = 'passage' AND tc.content_id = rp.passage_id
      WHERE tc.approval_status IN ('pending', 'pending_asl')
      ORDER BY tc.created_at DESC
    `);
    
    // For each pending_asl item, check which ASL resources are missing
    for (const item of content) {
      if (item.approval_status === 'pending_asl' && item.asl_required) {
        const aslSigns = JSON.parse(item.asl_required || '[]');
        const missing = [];
        
        for (const sign of aslSigns) {
          let signValue;
          if (typeof sign === 'string') {
            signValue = sign;
          } else if (sign && sign.value) {
            signValue = sign.value;
          } else {
            continue;
          }
          
          if (!signValue) continue;
          
          const signType = /^\d+$/.test(signValue.toString()) ? 'number' : 'word';
          const existing = await query(
            'SELECT id FROM asl_resources WHERE type = ? AND value = ?',
            [signType, signValue.toString()]
          );
          
          if (existing.length === 0) {
            missing.push({ type: signType, value: signValue });
          }
        }
        
        item.missing_asl = missing;
      }
    }
    
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Get pending content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending content' });
  }
};

// Approve content
const approveContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const adminId = req.admin?.adminId || req.admin?.admin_id;
    
    // Get content info first
    const contentRows = await query(
      'SELECT teacher_id, content_type, content_id FROM teacher_content WHERE id = ?',
      [contentId]
    );
    const content = contentRows[0];
    
    // Update teacher_content status
    await query(
      'UPDATE teacher_content SET approval_status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      ['approved', adminId, contentId]
    );
    
    // Activate the actual content (question or passage)
    if (content.content_type === 'question') {
      await query(
        'UPDATE question SET is_active = 1 WHERE question_id = ?',
        [content.content_id]
      );
    } else if (content.content_type === 'passage') {
      await query(
        'UPDATE reading_passage SET is_active = 1 WHERE passage_id = ?',
        [content.content_id]
      );
    }

    // Create notification for teacher (related_id refers to the actual content record)
    await query(
      `INSERT INTO notifications (user_id, user_type, notification_type, title, message, related_id) 
       VALUES (?, 'teacher', 'content_approved', ?, ?, ?)`,
      [
        content.teacher_id,
        'Content Approved',
        `Your ${content.content_type} has been approved and is now live!`,
        content.content_id || contentId
      ]
    );
    
    res.json({ success: true, message: 'Content approved successfully' });
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve content' });
  }
};

// Reject content
const rejectContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { reason } = req.body;
    const adminId = req.admin?.adminId || req.admin?.admin_id;
    
    await query(
      'UPDATE teacher_content SET approval_status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      ['rejected', reason || 'No reason provided', adminId, contentId]
    );
    
    // Get content info
    const contentRows = await query(
      'SELECT teacher_id, content_type, content_id FROM teacher_content WHERE id = ?',
      [contentId]
    );
    const content = contentRows[0];

    // Create notification for teacher
    await query(
      `INSERT INTO notifications (user_id, user_type, notification_type, title, message, related_id) 
       VALUES (?, 'teacher', 'content_rejected', ?, ?, ?)`,
      [
        content.teacher_id,
        'Content Rejected',
        `Your ${content.content_type} was not approved. Reason: ${reason || 'No reason provided'}`,
        content.content_id || contentId
      ]
    );
    
    res.json({ success: true, message: 'Content rejected' });
  } catch (error) {
    console.error('Reject content error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject content' });
  }
};

// Get notifications for admin
const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.admin?.adminId || req.admin?.admin_id;
    
    const notifications = await query(
      'SELECT * FROM notifications WHERE user_type = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50',
      ['admin', adminId]
    );
    
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    res.json({ 
      success: true, 
      data: notifications,
      unreadCount 
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    );
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification' });
  }
};

module.exports = {
  // Questions
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  // Subjects
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  // Sections
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  // Activities
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  // Achievements
  getAllAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  // Dashboard
  getDashboardStats,
  // Homepage Settings
  getHomepageSettings,
  updateHomepageSetting,
  bulkUpdateHomepageSettings,
  resetHomepageSettings,
  // Teacher Management
  getPendingTeachers,
  getAllTeachers,
  approveTeacher,
  rejectTeacher,
  // Content Approval
  getPendingContent,
  approveContent,
  rejectContent,
  // Notifications
  getAdminNotifications,
  markNotificationRead
};
