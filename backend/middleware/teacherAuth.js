const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const teacherAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
        
        if (decoded.type !== 'teacher') {
            return res.status(403).json({ error: 'Access denied. Teacher credentials required.' });
        }

        // Get teacher from database
        const teachers = await query(
            'SELECT id, name, email, status FROM teachers WHERE id = ?',
            [decoded.id]
        );

        if (teachers.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const teacher = teachers[0];

        // Check if teacher is approved
        if (teacher.status !== 'approved') {
            return res.status(403).json({ 
                error: 'Account not approved', 
                status: teacher.status,
                message: teacher.status === 'pending' 
                    ? 'Your account is pending approval' 
                    : 'Your account has been rejected'
            });
        }

        // Attach teacher to request
        req.teacher = teacher;
        req.teacherId = teacher.id;
        req.userType = 'teacher';
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Teacher auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

module.exports = teacherAuth;
