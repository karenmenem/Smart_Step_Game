const { query } = require('./config/database');

async function checkMessages() {
    try {
        console.log('\n📨 Checking messages...\n');
        
        // Check all messages
        const messages = await query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 10');
        console.log('Total messages:', messages.length);
        
        if (messages.length > 0) {
            console.log('\nRecent messages:');
            messages.forEach(msg => {
                console.log('---');
                console.log('ID:', msg.id);
                console.log('From:', msg.sender_type, msg.sender_id);
                console.log('To:', msg.recipient_type, msg.recipient_id);
                console.log('Message:', msg.message);
                console.log('Created:', msg.created_at);
            });
        } else {
            console.log('❌ No messages found in database');
        }
        
        // Check admin users
        console.log('\n\n👤 Checking admin users:');
        const admins = await query('SELECT admin_id, username FROM admin');
        console.log('Admins:', admins);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkMessages();
