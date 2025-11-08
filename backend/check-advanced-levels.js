const mysql = require('mysql2/promise');

async function checkAdvancedLevels() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Checking Addition Advanced Levels ===\n');
    
    // Check activities 13 and 14 (Advanced L1 and L2)
    const [activities] = await connection.query(
      'SELECT activity_id, name, description FROM activity WHERE activity_id IN (13, 14) ORDER BY activity_id'
    );
    
    for (const activity of activities) {
      console.log(`✅ Activity ${activity.activity_id}: ${activity.name}`);
      console.log(`   Description: ${activity.description}`);
      
      const [questions] = await connection.query(
        'SELECT COUNT(*) as count FROM Question WHERE activity_id = ?',
        [activity.activity_id]
      );
      console.log(`   Current questions: ${questions[0].count}\n`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkAdvancedLevels().catch(console.error);
