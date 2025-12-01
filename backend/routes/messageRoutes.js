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
    let adminError = null;
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
        adminError = err;
    }
    
    // Try teacher auth
    try {
        const result = await new Promise((resolve, reject) => {
            teacherAuth(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Teacher auth succeeded
        return next();
    } catch (err) {
        // Both failed
        console.error('Combined auth failed:', { adminError, teacherError: err });
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
