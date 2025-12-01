const { query } = require('./config/database');

async function checkPendingASL() {
    try {
        console.log('\n📋 Checking pending_asl content...\n');
        
        // Check teacher_content with pending_asl status
        const pendingASL = await query(`
            SELECT tc.*, q.question_text, q.asl_signs, q.asl_complete, t.name as teacher_name
            FROM teacher_content tc
            LEFT JOIN question q ON tc.content_type = 'question' AND tc.content_id = q.question_id
            LEFT JOIN teachers t ON tc.teacher_id = t.id
            WHERE tc.approval_status = 'pending_asl'
        `);
        
        console.log('Found', pendingASL.length, 'items with pending_asl status');
        
        for (const item of pendingASL) {
            console.log('\n---');
            console.log('Content ID:', item.id);
            console.log('Teacher:', item.teacher_name);
            console.log('Question:', item.question_text);
            console.log('ASL Signs:', item.asl_signs);
            console.log('ASL Complete:', item.asl_complete);
            
            if (item.asl_signs) {
                const signs = JSON.parse(item.asl_signs);
                console.log('Checking ASL resources for:', signs);
                
                for (const sign of signs) {
                    const signValue = typeof sign === 'string' ? sign : sign.value;
                    const signType = /^\d+$/.test(signValue) ? 'number' : 'word';
                    
                    const existing = await query(
                        'SELECT * FROM asl_resources WHERE type = ? AND value = ?',
                        [signType, signValue]
                    );
                    
                    if (existing.length > 0) {
                        console.log('  ✅', signValue, '(', signType, ') - EXISTS');
                    } else {
                        console.log('  ❌', signValue, '(', signType, ') - MISSING');
                    }
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPendingASL();
