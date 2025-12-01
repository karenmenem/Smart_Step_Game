const { query } = require('./config/database');

async function testTeacherConversations() {
    try {
        const userType = 'teacher';
        const userId = 5;
        
        console.log('\n🔍 Testing conversation loading for teacher...\n');
        console.log('Loading for:', { userType, userId });
        
        // Get all messages involving this user
        const allMessages = await query(
            `SELECT * FROM messages 
             WHERE (sender_type = ? AND sender_id = ?) OR (recipient_type = ? AND recipient_id = ?)
             ORDER BY created_at DESC`,
            [userType, userId, userType, userId]
        );
        
        console.log('\nFound messages:', allMessages.length);
        allMessages.forEach(msg => {
            console.log(`  [${msg.id}] ${msg.sender_type}(${msg.sender_id}) → ${msg.recipient_type}(${msg.recipient_id}): "${msg.message}"`);
        });
        
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
        console.log('\n✅ Conversations:', JSON.stringify(conversations, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testTeacherConversations();
