const { query } = require('./config/database');

(async () => {
  try {
    const children = await query('SELECT child_id, name FROM Child LIMIT 1');
    if (children.length === 0) {
      console.log('No children found');
      process.exit(0);
    }
    
    const childId = children[0].child_id;
    console.log('Checking progress for:', children[0].name, '(Child ID:', childId + ')');
    
    const progress = await query(
      'SELECT activity_id, score, max_score, completed FROM child_progress WHERE child_id = ? AND activity_id IN (61,62) ORDER BY activity_id',
      [childId]
    );
    
    console.log('\n=== Grammar Beginner Progress ===');
    if (progress.length === 0) {
      console.log('❌ No progress saved for Grammar!');
      console.log('\nThis means the quiz is not saving progress.');
      console.log('Check if:');
      console.log('1. Backend is running (node server.js)');
      console.log('2. Quiz shows correct activity IDs');
    } else {
      progress.forEach(p => {
        const pct = Math.round((p.score / p.max_score) * 100);
        const actName = p.activity_id === 61 ? 'Beginner Level 1' : 'Beginner Level 2';
        const status = p.completed ? '✓ Completed' : '✗ Not completed';
        console.log(`${actName} (Activity ${p.activity_id}):`);
        console.log(`  Score: ${p.score}/${p.max_score} (${pct}%)`);
        console.log(`  Status: ${status}`);
        console.log('');
      });
      
      // Check if both are completed
      const level1 = progress.find(p => p.activity_id === 61);
      const level2 = progress.find(p => p.activity_id === 62);
      
      if (level1 && level2) {
        const pct1 = Math.round((level1.score / level1.max_score) * 100);
        const pct2 = Math.round((level2.score / level2.max_score) * 100);
        
        if (pct1 >= 80 && pct2 >= 80) {
          console.log('✅ Both levels completed with 80%+ - Intermediate Level 1 should unlock!');
        } else {
          console.log('⚠️  Need 80% on BOTH levels to unlock Intermediate');
          if (pct1 < 80) console.log(`   - Level 1: ${pct1}% (need 80%)`);
          if (pct2 < 80) console.log(`   - Level 2: ${pct2}% (need 80%)`);
        }
      } else {
        console.log('⚠️  Need to complete BOTH Beginner levels to unlock Intermediate');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
