const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const teacherAuth = require('../middleware/teacherAuth');
const {
    sendMessage,
    getConversations,
    getMessages,
    getNotifications,
    markNotificationRead,
    getUnreadCount
} = require('../controllers/messageController');

// Middleware that accepts either admin or teacher auth
const combinedAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Try admin auth first
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartstep-secret-key-2024');
        
        if (decoded.adminId) {
            // This is an admin token
            req.admin = decoded;
            req.userType = 'admin';
            return next();
        }
    } catch (err) {
        // Not an admin token, try teacher auth
    }
    
    // Try teacher auth
    try {
        await teacherAuth(req, res, () => {
            // Teacher auth sets req.teacher, req.teacherId, and req.userType
            next();
        });
    } catch (err) {
        console.error('Combined auth failed:', err);
        return res.status(401).json({ error: 'Authentication required' });
    }
};

// All routes require authentication (admin or teacher)
router.use(combinedAuth);

router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:partnerType/:partnerId', getMessages);
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId/read', markNotificationRead);
router.get('/unread-count', getUnreadCount);

module.exports = router;
