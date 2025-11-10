const { query } = require('./config/database');

async function checkQuestions() {
  try {
    // Count all questions
    const total = await query('SELECT COUNT(*) as count FROM question');
    console.log('Total questions:', total[0].count);
    
    // Check questions by activity
    const byActivity = await query(`
      SELECT activity_id, COUNT(*) as count 
      FROM question 
      GROUP BY activity_id 
      ORDER BY activity_id
    `);
    
    console.log('\nQuestions per activity:');
    byActivity.forEach(row => {
      console.log(`  Activity ${row.activity_id}: ${row.count} questions`);
    });
    
    // Get activity names
    const activities = await query(`
      SELECT a.activity_id, a.name, s.name as subject_name, s.level
      FROM activity a
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      ORDER BY a.activity_id
    `);
    
    console.log('\nActivity details:');
    activities.forEach(act => {
      const qCount = byActivity.find(q => q.activity_id === act.activity_id);
      console.log(`  ${act.activity_id}: ${act.name} (${act.subject_name} Level ${act.level}) - ${qCount ? qCount.count : 0} questions`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkQuestions();
