const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const teacherAuth = require('../middleware/teacherAuth');
const {
    sendMessage,
    getConversations,
    getMessages,
    getNotifications,
    markNotificationRead
} = require('../controllers/messageController');

// Middleware that accepts either admin or teacher auth
const combinedAuth = async (req, res, next) => {
    // Try admin auth first
    const adminToken = req.header('Authorization')?.replace('Bearer ', '');
    if (adminToken) {
        try {
            await adminAuth(req, res, () => {});
            if (req.admin) {
                return next();
            }
        } catch (err) {
            // Admin auth failed, try teacher auth
        }
    }
    
    // Try teacher auth
    try {
        await teacherAuth(req, res, next);
    } catch (err) {
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

module.exports = router;
