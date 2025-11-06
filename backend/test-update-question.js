const { query } = require('./config/database');

async function testUpdateQuestion() {
  try {
    console.log('Testing question update...');
    
    // First, let's see what questions exist
    const questions = await query('SELECT * FROM Question LIMIT 5');
    console.log('\n📋 Sample questions:', questions.map(q => ({
      id: q.question_id,
      text: q.question_text,
      activity: q.activity_id
    })));
    
    if (questions.length > 0) {
      const testId = questions[0].question_id;
      console.log(`\n🧪 Testing update on question ID: ${testId}`);
      
      // Try a simple update
      const result = await query(
        `UPDATE Question SET explanation = ? WHERE question_id = ?`,
        ['Test explanation', testId]
      );
      
      console.log('✅ Update result:', result);
      
      // Verify the update
      const updated = await query('SELECT * FROM Question WHERE question_id = ?', [testId]);
      console.log('✅ Updated question:', updated[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testUpdateQuestion();
