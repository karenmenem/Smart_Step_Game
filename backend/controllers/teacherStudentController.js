const { query } = require('../config/database');


function generateClassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get teacher's classes
const getTeacherClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const classes = await query(
      `SELECT * FROM teacher_classes 
       WHERE teacher_id = ? 
       ORDER BY created_at DESC`,
      [teacherId]
    );
    
    // Get student count for each class
    for (let cls of classes) {
      const count = await query(
        `SELECT COUNT(*) as count FROM child_teacher_access 
         WHERE class_id = ? AND is_active = TRUE AND parent_approved = TRUE`,
        [cls.id]
      );
      cls.student_count = count[0]?.count || 0;
    }
    
    res.json({ success: true, classes });
  } catch (error) {
    console.error('Error getting teacher classes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new class
const createTeacherClass = async (req, res) => {
  try {
    const { teacherId, className, description } = req.body;
    
    let classCode = generateClassCode();
    let exists = await query('SELECT id FROM teacher_classes WHERE class_code = ?', [classCode]);
    
    while (exists && exists.length > 0) {
      classCode = generateClassCode();
      exists = await query('SELECT id FROM teacher_classes WHERE class_code = ?', [classCode]);
    }
    
    const result = await query(
      `INSERT INTO teacher_classes (teacher_id, class_name, class_code, description, is_active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [teacherId, className, classCode, description]
    );
    
    res.json({
      success: true,
      class: {
        id: result.insertId,
        teacher_id: teacherId,
        class_name: className,
        class_code: classCode,
        description,
        is_active: true
      }
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get teacher's students with progress
const getTeacherStudents = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { classId } = req.query;
    
    let studentsQuery = `
      SELECT 
        cta.id as link_id,
        cta.child_id,
        cta.parent_approved,
        cta.share_progress,
        cta.share_scores,
        cta.share_time_spent,
        cta.linked_at,
        cta.approved_at,
        c.name as child_name,
        c.age,
        c.profile_picture,
        c.total_points,
        tc.class_name,
        tc.class_code
      FROM child_teacher_access cta
      JOIN child c ON cta.child_id = c.child_id
      LEFT JOIN teacher_classes tc ON cta.class_id = tc.id
      WHERE cta.teacher_id = ? 
        AND cta.is_active = TRUE
        AND cta.parent_approved = TRUE
    `;
    
    const params = [teacherId];
    
    if (classId) {
      studentsQuery += ' AND cta.class_id = ?';
      params.push(classId);
    }
    
    studentsQuery += ' ORDER BY c.name ASC';
    
    const students = await query(studentsQuery, params);
    
    // Get progress stats for each student
    for (let student of students) {
      // Total activities completed
      const completed = await query(
        `SELECT COUNT(DISTINCT activity_id) as count 
         FROM child_progress WHERE child_id = ?`,
        [student.child_id]
      );
      student.activities_completed = completed[0]?.count || 0;
      
      // Average score
      const avgScore = await query(
        `SELECT AVG((score / max_score) * 100) as avg_score 
         FROM child_progress WHERE child_id = ?`,
        [student.child_id]
      );
      student.average_score = Math.round(avgScore[0]?.avg_score || 0);
      
      // Recent activity
      const recent = await query(
        `SELECT last_attempt FROM child_progress 
         WHERE child_id = ? 
         ORDER BY last_attempt DESC LIMIT 1`,
        [student.child_id]
      );
      student.last_active = recent[0]?.last_attempt || null;
    }
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error getting teacher students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get detailed student progress
const getStudentProgress = async (req, res) => {
  try {
    const { teacherId, childId } = req.params;
    
    // Verify teacher has access
    const access = await query(
      `SELECT * FROM child_teacher_access 
       WHERE teacher_id = ? AND child_id = ? 
       AND is_active = TRUE AND parent_approved = TRUE`,
      [teacherId, childId]
    );
    
    if (!access || access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const permissions = access[0];
    
    // Get child info
    const childInfo = await query(
      'SELECT name, age, profile_picture, total_points FROM child WHERE child_id = ?',
      [childId]
    );
    
    if (!childInfo || childInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get all progress with activity details
    const progress = await query(
      `SELECT 
        cp.*,
        a.name as activity_name,
        s.name as section_name,
        sub.name as subject_name
      FROM child_progress cp
      JOIN activity a ON cp.activity_id = a.activity_id
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      WHERE cp.child_id = ?
      ORDER BY cp.last_attempt DESC`,
      [childId]
    );
    
    // Calculate statistics
    const stats = {
      total_activities: progress.length,
      average_score: 0,
      total_attempts: 0,
      subjects: {}
    };
    
    if (progress.length > 0) {
      let totalPercentage = 0;
      
      progress.forEach(p => {
        const percentage = (p.score / p.max_score) * 100;
        totalPercentage += percentage;
        stats.total_attempts += p.attempts || 1;
        
        // Group by subject
        if (!stats.subjects[p.subject_name]) {
          stats.subjects[p.subject_name] = {
            activities: 0,
            avg_score: 0,
            scores: []
          };
        }
        stats.subjects[p.subject_name].activities++;
        stats.subjects[p.subject_name].scores.push(percentage);
      });
      
      stats.average_score = Math.round(totalPercentage / progress.length);
      
      // Calculate subject averages
      Object.keys(stats.subjects).forEach(subject => {
        const subj = stats.subjects[subject];
        const avg = subj.scores.reduce((a, b) => a + b, 0) / subj.scores.length;
        subj.avg_score = Math.round(avg);
        delete subj.scores;
      });
    }
    
    // Filter progress based on permissions
    let filteredProgress = progress;
    if (!permissions.share_scores) {
      filteredProgress = filteredProgress.map(p => {
        const { score, max_score, ...rest } = p;
        return rest;
      });
    }
    
    res.json({
      success: true,
      student: childInfo[0],
      permissions,
      progress: filteredProgress,
      stats: permissions.share_scores ? stats : null
    });
  } catch (error) {
    console.error('Error getting student progress:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Link child to teacher (parent action)
const linkChildToTeacher = async (req, res) => {
  try {
    const { childId, classCode } = req.body;
    
    // Find class by code
    const classData = await query(
      `SELECT tc.*, t.name as teacher_name, t.email as teacher_email
       FROM teacher_classes tc
       JOIN teachers t ON tc.teacher_id = t.id
       WHERE tc.class_code = ? AND tc.is_active = TRUE`,
      [classCode]
    );
    
    if (!classData || classData.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid class code' });
    }
    
    const cls = classData[0];
    
    // Check if already linked
    const existing = await query(
      `SELECT * FROM child_teacher_access 
       WHERE child_id = ? AND teacher_id = ?`,
      [childId, cls.teacher_id]
    );
    
    if (existing && existing.length > 0) {
      // Update existing link
      await query(
        `UPDATE child_teacher_access 
         SET class_id = ?, is_active = TRUE, parent_approved = FALSE, approved_at = NULL
         WHERE child_id = ? AND teacher_id = ?`,
        [cls.id, childId, cls.teacher_id]
      );
      
      return res.json({
        success: true,
        message: 'Updated teacher link - pending parent approval',
        teacher: {
          name: cls.teacher_name,
          email: cls.teacher_email,
          class_name: cls.class_name
        }
      });
    }
    
    // Create new link
    await query(
      `INSERT INTO child_teacher_access 
       (child_id, teacher_id, class_id, parent_approved, is_active)
       VALUES (?, ?, ?, FALSE, TRUE)`,
      [childId, cls.teacher_id, cls.id]
    );
    
    res.json({
      success: true,
      message: 'Successfully linked to teacher - pending parent approval',
      teacher: {
        name: cls.teacher_name,
        email: cls.teacher_email,
        class_name: cls.class_name
      }
    });
  } catch (error) {
    console.error('Error linking child to teacher:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get child's teacher links (for parent dashboard)
const getChildTeacherLinks = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const links = await query(
      `SELECT 
        cta.*,
        t.name as teacher_name,
        t.email as teacher_email,
        tc.class_name,
        tc.class_code
      FROM child_teacher_access cta
      JOIN teachers t ON cta.teacher_id = t.id
      LEFT JOIN teacher_classes tc ON cta.class_id = tc.id
      WHERE cta.child_id = ? AND cta.is_active = TRUE
      ORDER BY cta.linked_at DESC`,
      [childId]
    );
    
    res.json({ success: true, links });
  } catch (error) {
    console.error('Error getting teacher links:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update parent permissions
const updateTeacherPermissions = async (req, res) => {
  try {
    const { linkId } = req.params;
    const { parentApproved, shareProgress, shareScores, shareTimeSpent } = req.body;
    
    const updates = [];
    const values = [];
    
    if (parentApproved !== undefined) {
      updates.push('parent_approved = ?');
      values.push(parentApproved);
      if (parentApproved) {
        updates.push('approved_at = NOW()');
      }
    }
    if (shareProgress !== undefined) {
      updates.push('share_progress = ?');
      values.push(shareProgress);
    }
    if (shareScores !== undefined) {
      updates.push('share_scores = ?');
      values.push(shareScores);
    }
    if (shareTimeSpent !== undefined) {
      updates.push('share_time_spent = ?');
      values.push(shareTimeSpent);
    }
    
    values.push(linkId);
    
    await query(
      `UPDATE child_teacher_access SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ success: true, message: 'Permissions updated' });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove teacher link
const removeTeacherLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    
    await query(
      'UPDATE child_teacher_access SET is_active = FALSE WHERE id = ?',
      [linkId]
    );
    
    res.json({ success: true, message: 'Teacher link removed' });
  } catch (error) {
    console.error('Error removing teacher link:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTeacherClasses,
  createTeacherClass,
  getTeacherStudents,
  getStudentProgress,
  linkChildToTeacher,
  getChildTeacherLinks,
  updateTeacherPermissions,
  removeTeacherLink
};
