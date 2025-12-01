const { query } = require('./config/database');

async function fixPendingASL() {
    try {
        console.log('\n🔧 Fixing pending_asl items that have complete ASL...\n');
        
        // Get all pending_asl items
        const pendingASL = await query(`
            SELECT tc.id, tc.content_id, q.asl_complete, q.question_text
            FROM teacher_content tc
            LEFT JOIN question q ON tc.content_type = 'question' AND tc.content_id = q.question_id
            WHERE tc.approval_status = 'pending_asl' AND q.asl_complete = 1
        `);
        
        console.log('Found', pendingASL.length, 'items to update');
        
        for (const item of pendingASL) {
            console.log('Updating content ID:', item.id, '-', item.question_text);
            await query(
                `UPDATE teacher_content 
                 SET approval_status = 'pending' 
                 WHERE id = ?`,
                [item.id]
            );
            console.log('  ✅ Updated to "pending" status');
        }
        
        console.log('\n✨ Done! Items can now be approved by admin.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixPendingASL();
