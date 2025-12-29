const { query } = require('../config/database');


const sendMessage = async (req, res) => {
    try {
        const { recipientId, recipientType, message, relatedContentType, relatedContentId } = req.body;
        const senderType = req.userType; // 'admin' or 'teacher'
        const senderId = req.userType === 'admin' ? req.admin.adminId || req.admin.admin_id : req.teacherId;
        
        if (!recipientId || !recipientType || !message) {
            return res.status(400).json({ error: 'Recipient and message are required' });
        }
        
        // Simple insert without optional related fields
        const result = await query(
            `INSERT INTO messages (sender_id, sender_type, recipient_id, recipient_type, message) 
             VALUES (?, ?, ?, ?, ?)`,
            [senderId, senderType, recipientId, recipientType, message]
        );
        
        
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


const getConversations = async (req, res) => {
    try {
        const userType = req.userType;
        const userId = userType === 'admin' ? req.admin.adminId || req.admin.admin_id : req.teacherId;
        
        console.log('Getting conversations for:', { userType, userId });
        
        
        const allMessages = await query(
            `SELECT * FROM messages 
             WHERE (sender_type = ? AND sender_id = ?) OR (recipient_type = ? AND recipient_id = ?)
             ORDER BY created_at DESC`,
            [userType, userId, userType, userId]
        );
        
        console.log('Found messages:', allMessages.length);
        
        
        const conversationsMap = {};
        
        allMessages.forEach(msg => {
            // Determine who the partner is
            let partnerId, partnerType;
            if (msg.sender_type === userType && msg.sender_id == userId) {
                // We sent this message
                partnerId = msg.recipient_id;
                partnerType = msg.recipient_type;
            } else {
                // We received this message
                partnerId = msg.sender_id;
                partnerType = msg.sender_type;
            }
            
            const key = `${partnerType}-${partnerId}`;
            
            if (!conversationsMap[key]) {
                conversationsMap[key] = {
                    partner_id: partnerId,
                    partner_type: partnerType,
                    last_message: msg.message,
                    last_message_time: msg.created_at,
                    unread_count: 0
                };
            }
            
            // Count unread messages from this partner
            if (msg.recipient_type === userType && msg.recipient_id == userId && !msg.is_read) {
                conversationsMap[key].unread_count++;
            }
        });
        
        const conversations = Object.values(conversationsMap);
        console.log('Conversations:', conversations);
        
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

// Get unread message count
const getUnreadCount = async (req, res) => {
    try {
        const userType = req.userType;
        const userId = userType === 'admin' ? req.admin.adminId || req.admin.admin_id : req.teacherId;
        
        const result = await query(
            `SELECT COUNT(*) as count FROM messages 
             WHERE recipient_type = ? AND recipient_id = ? AND is_read = FALSE`,
            [userType, userId]
        );
        
        res.json({ 
            success: true, 
            count: result[0].count 
        });
        
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessages,
    getNotifications,
    markNotificationRead,
    getUnreadCount
};
