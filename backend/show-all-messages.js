const { query } = require('./config/database');

async function checkAllMessages() {
    const messages = await query('SELECT * FROM messages ORDER BY created_at DESC');
    console.log('\n📨 All Messages:\n');
    messages.forEach(msg => {
        console.log(`[${msg.id}] ${msg.sender_type}(${msg.sender_id}) → ${msg.recipient_type}(${msg.recipient_id})`);
        console.log(`    Message: "${msg.message}"`);
        console.log(`    Read: ${msg.is_read}, Time: ${msg.created_at}`);
        console.log('');
    });
    process.exit();
}

checkAllMessages();
