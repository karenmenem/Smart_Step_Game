const { query } = require('./config/database');

async function checkProgressSaved() {
  try {
    console.log('🔍 Checking if progress is being saved...\n');
    
    // Get all children
    const children = await query('SELECT child_id, name FROM child');
    
    if (children.length === 0) {
      console.log('⚠️  No children found in database');
      console.log('   Create an account first to test progress tracking!');
      process.exit(0);
    }
    
    console.log(`Found ${children.length} child(ren):\n`);
    
    for (const child of children) {
      console.log(`📊 Child: ${child.name} (ID: ${child.child_id})`);
      
      // Get their progress
      const progress = await query(`
        SELECT cp.*, a.name as activity_name 
        FROM child_progress cp
        JOIN Activity a ON cp.activity_id = a.activity_id
        WHERE cp.child_id = ?
        ORDER BY cp.activity_id
      `, [child.child_id]);
      
      if (progress.length === 0) {
        console.log('   No progress yet - child hasn\'t completed any quizzes\n');
      } else {
        console.log(`   Progress records: ${progress.length}\n`);
        
        progress.forEach(p => {
          const percentage = Math.round((p.score / p.max_score) * 100);
          const status = p.completed ? '✅ PASSED' : '❌ Not passed';
          console.log(`   ${status} ${p.activity_name}`);
          console.log(`      Score: ${p.score}/${p.max_score} (${percentage}%)`);
          console.log(`      Attempts: ${p.attempts}`);
          console.log(`      Last: ${p.last_attempt}`);
          console.log('');
        });
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 How to test:');
    console.log('   1. Login to the app');
    console.log('   2. Complete Addition Level 1 quiz');
    console.log('   3. Run this script again to see saved progress');
    console.log('   4. Logout and login again');
    console.log('   5. Go to Math → Addition');
    console.log('   6. If you scored 80%+, Level 2 should be unlocked!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProgressSaved();
