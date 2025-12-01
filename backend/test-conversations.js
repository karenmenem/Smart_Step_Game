const { query } = require('./config/database');

async function testConversations() {
    try {
        console.log('\n🔍 Testing conversation loading...\n');
        
        // Test as admin (admin_id = 1)
        const userType = 'admin';
        const userId = 1;
        
        console.log('Loading for:', { userType, userId });
        
        // Get all messages involving this user
        const allMessages = await query(
            `SELECT * FROM messages 
             WHERE (sender_type = ? AND sender_id = ?) OR (recipient_type = ? AND recipient_id = ?)
             ORDER BY created_at DESC`,
            [userType, userId, userType, userId]
        );
        
        console.log('\nFound messages:', allMessages.length);
        console.log('Messages:', JSON.stringify(allMessages, null, 2));
        
        // Group by conversation partner
        const conversationsMap = {};
        
        allMessages.forEach(msg => {
            let partnerId, partnerType;
            if (msg.sender_type === userType && msg.sender_id == userId) {
                partnerId = msg.recipient_id;
                partnerType = msg.recipient_type;
            } else {
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
            
            if (msg.recipient_type === userType && msg.recipient_id == userId && !msg.is_read) {
                conversationsMap[key].unread_count++;
            }
        });
        
        const conversations = Object.values(conversationsMap);
        console.log('\n✅ Conversations found:', conversations.length);
        console.log('Conversations:', JSON.stringify(conversations, null, 2));
        
        // Get teacher name
        for (const conv of conversations) {
            if (conv.partner_type === 'teacher') {
                const teachers = await query('SELECT name FROM teachers WHERE id = ?', [conv.partner_id]);
                console.log('\nTeacher found:', teachers[0]);
                conv.partner_name = teachers[0]?.name || 'Teacher';
            }
        }
        
        console.log('\n📋 Final conversations:', JSON.stringify(conversations, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testConversations();
