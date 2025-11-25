const { query } = require('../config/database');

// Send message
const sendMessage = async (req, res) => {
    try {
        const { recipientId, recipientType, message, relatedContentType, relatedContentId } = req.body;
        const senderType = req.userType; // 'admin' or 'teacher'
        const senderId = req.userType === 'admin' ? req.admin.adminId || req.admin.admin_id : req.teacherId;
        
        if (!recipientId || !recipientType || !message) {
            return res.status(400).json({ error: 'Recipient and message are required' });
        }
        
        const result = await query(
            `INSERT INTO messages (sender_id, sender_type, recipient_id, recipient_type, message, related_content_type, related_content_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [senderId, senderType, recipientId, recipientType, message, relatedContentType || 'general', relatedContentId || null]
        );
        
        // Create notification for recipient
        await query(
            `INSERT INTO notifications (user_id, user_type, notification_type, title, message, related_id) 
             VALUES (?, ?, 'new_message', ?, ?, ?)`,
            [
                recipientId,
                recipientType,
                'New Message',
                `You have a new message from ${senderType}`,
                result.insertId
            ]
        );
        
        res.status(201).json({ 
            success: true, 
            message: 'Message sent successfully',
            messageId: result.insertId
        });
        
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get conversations for current user
const getConversations = async (req, res) => {
    try {
        const userType = req.userType;
        const userId = userType === 'admin' ? req.admin.adminId || req.admin.admin_id : req.teacherId;
        
        // Get all unique conversation partners with last message
        const conversations = await query(
            `SELECT DISTINCT
                CASE 
                    WHEN sender_type = ? AND sender_id = ? THEN recipient_id
                    ELSE sender_id
                END as partner_id,
                CASE 
                    WHEN sender_type = ? AND sender_id = ? THEN recipient_type
                    ELSE sender_type
                END as partner_type,
                (SELECT message FROM messages m2 
                 WHERE (m2.sender_type = ? AND m2.sender_id = ? AND m2.recipient_type = partner_type AND m2.recipient_id = partner_id)
                    OR (m2.recipient_type = ? AND m2.recipient_id = ? AND m2.sender_type = partner_type AND m2.sender_id = partner_id)
                 ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM messages m2 
                 WHERE (m2.sender_type = ? AND m2.sender_id = ? AND m2.recipient_type = partner_type AND m2.recipient_id = partner_id)
                    OR (m2.recipient_type = ? AND m2.recipient_id = ? AND m2.sender_type = partner_type AND m2.sender_id = partner_id)
                 ORDER BY m2.created_at DESC LIMIT 1) as last_message_time,
                (SELECT COUNT(*) FROM messages m2 
                 WHERE m2.recipient_type = ? AND m2.recipient_id = ? 
                   AND m2.sender_type = partner_type AND m2.sender_id = partner_id 
                   AND m2.is_read = FALSE) as unread_count
            FROM messages
            WHERE (sender_type = ? AND sender_id = ?) OR (recipient_type = ? AND recipient_id = ?)
            ORDER BY last_message_time DESC`,
            [
                userType, userId, userType, userId,
                userType, userId, userType, userId,
                userType, userId, userType, userId,
                userType, userId,
                userType, userId, userType, userId
            ]
        );
        
        // Get names for each partner
        for (const conv of conversations) {
            if (conv.partner_type === 'admin') {
                const admins = await query('SELECT username as name FROM admin WHERE admin_id = ?', [conv.partner_id]);
                conv.partner_name = admins[0]?.name || 'Admin';
            } else {
                const teachers = await query('SELECT name FROM teachers WHERE id = ?', [conv.partner_id]);
                conv.partner_name = teachers[0]?.name || 'Teacher';
            }
        }
        
        res.json({ success: true, data: conversations });
        
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to get conversations' });
    }
};

// Get messages in a conversation
const getMessages = async (req, res) => {
    try {
        const { partnerId, partnerType } = req.params;
        const userType = req.userType;
        const userId = userType === 'admin' ? req.admin.adminId || req.admin.admin_id : req.teacherId;
        
        const messages = await query(
            `SELECT * FROM messages 
             WHERE (sender_type = ? AND sender_id = ? AND recipient_type = ? AND recipient_id = ?)
                OR (recipient_type = ? AND recipient_id = ? AND sender_type = ? AND sender_id = ?)
             ORDER BY created_at ASC`,
            [userType, userId, partnerType, partnerId, userType, userId, partnerType, partnerId]
        );
        
        // Mark messages as read
        await query(
            `UPDATE messages SET is_read = TRUE 
             WHERE recipient_type = ? AND recipient_id = ? AND sender_type = ? AND sender_id = ?`,
            [userType, userId, partnerType, partnerId]
        );
        
        res.json({ success: true, data: messages });
        
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};

// Get notifications for user
const getNotifications = async (req, res) => {
    try {
        const userType = req.userType;
        const userId = userType === 'admin' ? req.admin.adminId || req.admin.admin_id : req.teacherId;
        
        const notifications = await query(
            'SELECT * FROM notifications WHERE user_type = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userType, userId]
        );
        
        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        res.json({ 
            success: true, 
            data: notifications,
            unreadCount 
        });
        
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
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
        res.status(500).json({ error: 'Failed to mark notification' });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessages,
    getNotifications,
    markNotificationRead
};
