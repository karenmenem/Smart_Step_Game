const { query } = require('./config/database');

(async () => {
  try {
    console.log('Testing is_active column...\n');
    
    // Check column exists
    const cols = await query('SHOW COLUMNS FROM question LIKE "is_active"');
    console.log('1. Column exists:', cols.length > 0);
    
    if (cols.length > 0) {
      console.log('   Details:', cols[0]);
      
      // Get sample data
      const samples = await query('SELECT question_id, question_text, is_active FROM question LIMIT 5');
      console.log('\n2. Sample questions:');
      samples.forEach(q => {
        console.log(`   ID ${q.question_id}: is_active = ${q.is_active} (${q.question_text.substring(0, 40)}...)`);
      });
      
      // Count active/inactive
      const counts = await query('SELECT is_active, COUNT(*) as count FROM question GROUP BY is_active');
      console.log('\n3. Question counts:');
      counts.forEach(c => {
        console.log(`   is_active=${c.is_active}: ${c.count} questions`);
      });
      
      // Test update
      const testId = samples[0].question_id;
      console.log(`\n4. Testing update on question ${testId}...`);
      await query('UPDATE question SET is_active = 0 WHERE question_id = ?', [testId]);
      const updated = await query('SELECT question_id, is_active FROM question WHERE question_id = ?', [testId]);
      console.log(`   After update: is_active = ${updated[0].is_active}`);
      
      // Restore
      await query('UPDATE question SET is_active = 1 WHERE question_id = ?', [testId]);
      console.log('   Restored to active');
    }
    
    console.log('\n✅ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
