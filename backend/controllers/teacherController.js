const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const path = require('path');

// Register new teacher
const registerTeacher = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Certificate upload is required' });
        }

        // Check if email already exists
        const existing = await query(
            'SELECT id FROM teachers WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save certificate path
        const certificatePath = `/uploads/certificates/${req.file.filename}`;

        // Insert teacher
        const result = await query(
            'INSERT INTO teachers (name, email, password, certificate_path, status) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, certificatePath, 'pending']
        );

        // Create notification for admins
        const admins = await query('SELECT admin_id as id FROM admin');
        for (const admin of admins) {
            await query(
                `INSERT INTO notifications (user_id, user_type, notification_type, title, message, related_id) 
                 VALUES (?, 'admin', 'teacher_registration', ?, ?, ?)`,
                [
                    admin.id,
                    'New Teacher Registration',
                    `${name} has registered and is pending approval`,
                    result.insertId
                ]
            );
        }

        res.status(201).json({ 
            message: 'Registration successful. Your account is pending approval.',
            teacherId: result.insertId,
            status: 'pending'
        });

    } catch (error) {
        console.error('Teacher registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Teacher login
const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get teacher
        const teachers = await query(
            'SELECT * FROM teachers WHERE email = ?',
            [email]
        );

        if (teachers.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const teacher = teachers[0];

        // Check password
        const validPassword = await bcrypt.compare(password, teacher.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check status
        if (teacher.status === 'rejected') {
            return res.status(403).json({ 
                error: 'Account rejected',
                reason: teacher.rejection_reason
            });
        }

        if (teacher.status === 'pending') {
            return res.status(403).json({ 
                error: 'Account pending approval',
                message: 'Your account is waiting for admin approval'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: teacher.id, email: teacher.email, type: 'teacher' },
            process.env.JWT_SECRET || 'your-secret-key-change-this',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            teacher: {
                id: teacher.id,
                name: teacher.name,
                email: teacher.email,
                status: teacher.status
            }
        });

    } catch (error) {
        console.error('Teacher login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get teacher profile
const getTeacherProfile = async (req, res) => {
    try {
        const teachers = await query(
            'SELECT id, name, email, status, created_at FROM teachers WHERE id = ?',
            [req.teacherId]
        );

        if (teachers.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json(teachers[0]);

    } catch (error) {
        console.error('Get teacher profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

// Get teacher's submitted content
const getTeacherContent = async (req, res) => {
    try {
        const content = await query(
            `SELECT tc.*, 
                    CASE 
                        WHEN tc.content_type = 'question' THEN q.question_text
                        WHEN tc.content_type = 'passage' THEN rp.content
                    END as content_preview
             FROM teacher_content tc
             LEFT JOIN question q ON tc.content_type = 'question' AND tc.content_id = q.question_id
             LEFT JOIN reading_passage rp ON tc.content_type = 'passage' AND tc.content_id = rp.passage_id
             WHERE tc.teacher_id = ?
             ORDER BY tc.created_at DESC`,
            [req.teacherId]
        );

        res.json(content);

    } catch (error) {
        console.error('Get teacher content error:', error);
        res.status(500).json({ error: 'Failed to get content' });
    }
};

// Create question (teacher submission - requires approval)
const createQuestion = async (req, res) => {
    try {
        const teacherId = req.teacherId;
        const {
            activity_id, activityId,
            question_text, questionText,
            question_type, questionType,
            correct_answer, correctAnswer,
            options, asl_signs, aslSigns,
            asl_video_url, aslVideoUrl,
            asl_type, aslType,
            explanation, difficulty_level, difficultyLevel,
            points_value, pointsValue,
            order_index, orderIndex
        } = req.body;
        
        const actId = activity_id || activityId;
        const qText = question_text || questionText;
        const qType = question_type || questionType;
        const correctAns = correct_answer || correctAnswer;
        const aslS = asl_signs || aslSigns;
        const aslVid = asl_video_url || aslVideoUrl;
        const aslT = asl_type || aslType || 'none';
        
        if (!actId || !qText || !qType || !correctAns) {
            return res.status(400).json({
                error: 'Activity ID, question text, type, and correct answer are required'
            });
        }
        
        let optionsData = options;
        if (typeof options === 'string') {
            try { optionsData = JSON.parse(options); } catch (e) { optionsData = options; }
        }
        
        let aslSignsData = aslS;
        if (typeof aslS === 'string' && aslS.trim()) {
            try { aslSignsData = JSON.parse(aslS); } catch (e) { aslSignsData = aslS; }
        }
        
        // Check if ASL resources are required and exist
        const needsASL = aslSignsData && Array.isArray(aslSignsData) && aslSignsData.length > 0;
        let hasASLVideos = !!aslVid; // If teacher provided direct URL
        let missingASL = [];
        
        if (needsASL && !hasASLVideos) {
            // Check if ASL resources exist in database for each sign
            for (const sign of aslSignsData) {
                if (!sign || !sign.value) continue;
                
                // Determine type: number if it's a digit, otherwise word
                const signType = /^\d+$/.test(sign.value.toString()) ? 'number' : 'word';
                
                const existing = await query(
                    'SELECT id FROM asl_resources WHERE type = ? AND value = ?',
                    [signType, sign.value.toString()]
                );
                
                if (existing.length === 0) {
                    missingASL.push({ type: signType, value: sign.value });
                }
            }
            hasASLVideos = missingASL.length === 0;
        }
        
        const passageId = req.body.passage_id || req.body.passageId || null;
        const diffLevel = difficulty_level || difficultyLevel || 1;
        const ptsValue = points_value || pointsValue || 10;
        const ordIdx = order_index || orderIndex || 1;
        
        // Insert question into question table (only fields that exist in schema)
        const result = await query(
            `INSERT INTO question 
            (activity_id, passage_id, question_text, question_type, correct_answer, options, asl_signs, 
             asl_video_url, asl_type, explanation, difficulty_level, points_value, order_index) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                actId, passageId, qText, qType, correctAns,
                typeof optionsData === 'string' ? optionsData : JSON.stringify(optionsData || []),
                typeof aslSignsData === 'string' ? aslSignsData : JSON.stringify(aslSignsData || []),
                aslVid || null, aslT, explanation || null,
                diffLevel, ptsValue, ordIdx
            ]
        );
        
        const questionId = result.insertId;
        
        // Determine approval status
        const approvalStatus = needsASL && !hasASLVideos ? 'pending_asl' : 'pending';
        
        // Create teacher_content entry
        await query(
            'INSERT INTO teacher_content (teacher_id, content_type, content_id, approval_status) VALUES (?, ?, ?, ?)',
            [teacherId, 'question', questionId, approvalStatus]
        );
        
        // Handle optional message to admin
        const teacherMessage = req.body.message || req.body.admin_message;
        if (teacherMessage && teacherMessage.trim()) {
            const admins = await query('SELECT admin_id as id FROM admin');
            for (const admin of admins) {
                await query(
                    `INSERT INTO messages (sender_id, sender_type, recipient_id, recipient_type, message, related_content_type, related_content_id) 
                     VALUES (?, 'teacher', ?, 'admin', ?, 'question', ?)`,
                    [teacherId, admin.id, teacherMessage.trim(), questionId]
                );
            }
        }
        
        // Notify all admins
        const admins = await query('SELECT admin_id as id FROM admin');
        for (const admin of admins) {
            const notificationMessage = needsASL && !hasASLVideos 
                ? `A teacher submitted a question that needs ASL resources: ${missingASL.map(m => `${m.value} (${m.type})`).join(', ')}`
                : 'A teacher submitted a new question for approval';
                
            await query(
                `INSERT INTO notifications (user_id, user_type, notification_type, title, message, related_id) 
                 VALUES (?, 'admin', ?, ?, ?, ?)`,
                [
                    admin.id,
                    needsASL && !hasASLVideos ? 'asl_pending' : 'content_pending',
                    needsASL && !hasASLVideos ? 'Question Needs ASL Resources' : 'New Question Pending Approval',
                    notificationMessage,
                    questionId
                ]
            );
        }
        
        const responseMessage = needsASL && !hasASLVideos 
            ? `Question submitted! Waiting for admin to add these ASL resources: ${missingASL.map(m => `${m.value} (${m.type})`).join(', ')}`
            : 'Question submitted for approval!';
        
        res.status(201).json({
            success: true,
            message: responseMessage,
            data: { 
                questionId, 
                status: approvalStatus,
                ...(missingASL.length > 0 && { missingASL })
            }
        });
        
    } catch (error) {
        console.error('Teacher create question error:', error);
        res.status(500).json({ error: 'Failed to create question' });
    }
};

// Create reading passage (teacher submission - requires approval)
const createPassage = async (req, res) => {
    try {
        const teacherId = req.teacherId;
        const { subject, topic, level, sublevel, title, author, content, passage, difficulty } = req.body;
        
        const passageContent = content || passage;
        
        if (!subject || !topic || !level || !sublevel || !title || !passageContent) {
            return res.status(400).json({
                error: 'Subject, topic, level, sublevel, title, and content are required'
            });
        }
        
        // Insert passage (not active until approved)
        const result = await query(
            `INSERT INTO reading_passage 
            (subject, topic, level, sublevel, title, author, content, passage, difficulty,
             created_by_type, created_by_id, has_required_asl) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'teacher', ?, TRUE)`,
            [subject, topic, level, sublevel, title, author || null, passageContent, passageContent, 
             difficulty || 'medium', teacherId]
        );
        
        const passageId = result.insertId;
        
        // Create teacher_content entry
        await query(
            'INSERT INTO teacher_content (teacher_id, content_type, content_id, approval_status) VALUES (?, ?, ?, ?)',
            [teacherId, 'passage', passageId, 'pending']
        );
        
        // Notify admins
        const admins = await query('SELECT admin_id as id FROM admin');
        for (const admin of admins) {
            await query(
                `INSERT INTO notifications (user_id, user_type, notification_type, title, message, related_id) 
                 VALUES (?, 'admin', 'content_pending', ?, ?, ?)`,
                [admin.id, 'New Reading Passage Pending', 'A teacher submitted a new reading passage for approval', passageId]
            );
        }
        
        res.status(201).json({
            success: true,
            message: 'Reading passage submitted for approval!',
            data: { passageId, status: 'pending' }
        });
        
    } catch (error) {
        console.error('Teacher create passage error:', error);
        res.status(500).json({ error: 'Failed to create passage' });
    }
};

module.exports = {
    registerTeacher,
    loginTeacher,
    getTeacherProfile,
    getTeacherContent,
    createQuestion,
    createPassage
};
