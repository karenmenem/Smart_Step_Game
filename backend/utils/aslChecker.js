const { query } = require('../config/database');

/**
 * Check all questions with incomplete ASL and update their status if ASL is now complete
 * This should be called whenever a new ASL resource is added to the database
 */
async function checkAndUpdateASLComplete() {
    try {
        // First, check for any pending_asl items that already have complete ASL
        // This handles cases where asl_complete was already TRUE but status wasn't updated
        const alreadyComplete = await query(`
            SELECT tc.id, tc.content_id, q.question_text
            FROM teacher_content tc
            LEFT JOIN question q ON tc.content_type = 'question' AND tc.content_id = q.question_id
            WHERE tc.approval_status = 'pending_asl' AND q.asl_complete = 1
        `);
        
        if (alreadyComplete.length > 0) {
            console.log(`Found ${alreadyComplete.length} items with complete ASL but pending_asl status...`);
            for (const item of alreadyComplete) {
                await query(
                    `UPDATE teacher_content 
                     SET approval_status = 'pending' 
                     WHERE id = ?`,
                    [item.id]
                );
                console.log(`✓ Updated content ${item.id} to pending status`);
            }
        }
        
        // Get all questions where asl_complete = FALSE
        const incompleteQuestions = await query(
            'SELECT question_id, asl_signs, asl_type FROM question WHERE asl_complete = FALSE'
        );
        
        console.log(`Checking ${incompleteQuestions.length} questions with incomplete ASL...`);
        
        for (const question of incompleteQuestions) {
            const aslSigns = JSON.parse(question.asl_signs || '[]');
            
            if (!aslSigns || aslSigns.length === 0) {
                // No ASL required, mark as complete
                await query('UPDATE question SET asl_complete = TRUE WHERE question_id = ?', [question.question_id]);
                console.log(`✓ Question ${question.question_id}: No ASL required, marked complete`);
                continue;
            }
            
            let allExist = true;
            let missingCount = 0;
            
            // Check each ASL sign
            for (const sign of aslSigns) {
                let signValue;
                if (typeof sign === 'string') {
                    signValue = sign;
                } else if (sign && sign.value) {
                    signValue = sign.value;
                } else {
                    continue;
                }
                
                if (!signValue) continue;
                
                const signType = /^\d+$/.test(signValue.toString()) ? 'number' : 'word';
                const existing = await query(
                    'SELECT id FROM asl_resources WHERE type = ? AND value = ?',
                    [signType, signValue.toString()]
                );
                
                if (existing.length === 0) {
                    allExist = false;
                    missingCount++;
                }
            }
            
            if (allExist) {
                // All ASL resources now exist, mark as complete
                await query('UPDATE question SET asl_complete = TRUE WHERE question_id = ?', [question.question_id]);
                console.log(`✓ Question ${question.question_id}: All ASL complete, ready for admin approval`);
                
                // Update teacher_content status from pending_asl to pending (so admin can approve)
                await query(
                    `UPDATE teacher_content 
                     SET approval_status = 'pending' 
                     WHERE content_type = 'question' 
                       AND content_id = ? 
                       AND approval_status = 'pending_asl'`,
                    [question.question_id]
                );
            } else {
                console.log(`  Question ${question.question_id}: Still missing ${missingCount} ASL resource(s)`);
            }
        }
        
        return { checked: incompleteQuestions.length };
        
    } catch (error) {
        console.error('Error checking ASL completion:', error);
        throw error;
    }
}

module.exports = { checkAndUpdateASLComplete };
