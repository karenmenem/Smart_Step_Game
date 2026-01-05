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
    
    // admin auth
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartstep-secret-key-2024');
        
        if (decoded.adminId) {
            // admin token hay
            req.admin = decoded;
            req.userType = 'admin';
            return next();
        }
    } catch (err) {
        
    }
    
    // teacher
    try {
        await teacherAuth(req, res, () => {
            
            next();
        });
    } catch (err) {
        console.error('Combined auth failed:', err);
        return res.status(401).json({ error: 'Authentication required' });
    }
};

// all routes li bdon authentication
router.use(combinedAuth);

router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:partnerType/:partnerId', getMessages);
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId/read', markNotificationRead);
router.get('/unread-count', getUnreadCount);

module.exports = router;
