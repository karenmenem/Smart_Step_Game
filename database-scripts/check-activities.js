const db = require('./config/database');

(async () => {
  try {
    // Check all tables
    const [tables] = await db.query(`SHOW TABLES`);
    console.log('Available tables:', tables);
    
    // Check questions
    const [questions] = await db.query(`
      SELECT DISTINCT activity_id 
      FROM questions 
      WHERE is_active = 1
      ORDER BY activity_id
    `);
    console.log('\nActivities with questions:', questions.map(q => q.activity_id));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
