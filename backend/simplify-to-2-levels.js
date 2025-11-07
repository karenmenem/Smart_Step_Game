const mysql = require('mysql2/promise');

async function simplifyTo2Levels() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Simplifying Math to 2 Levels Only ===\n');
    
    // Check current activities (these hold the questions)
    const [activities] = await connection.query(`
      SELECT a.activity_id, a.name, a.section_id, s.name as section_name
      FROM activity a
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      WHERE sub.name = 'Math'
      ORDER BY a.activity_id
    `);
    
    console.log('Current Math Activities:');
    activities.forEach(a => {
      console.log(`  Activity ${a.activity_id}: ${a.name} (Section: ${a.section_name})`);
    });
    
    // Count questions per activity
    for (let activity of activities) {
      const [questions] = await connection.query(
        'SELECT COUNT(*) as count FROM question WHERE activity_id = ?',
        [activity.activity_id]
      );
      console.log(`    └─ ${questions[0].count} questions`);
    }
    
    console.log('\n--- Plan ---');
    console.log('Keep activities 7 & 8 (Addition Level 1 & 2)');
    console.log('Delete activities 9-72 (Addition Level 3, Subtraction 1-3, Multiplication 1-3, Division 1-3)');
    console.log('\nThis will leave only 2 levels for Addition. You can then create content for:');
    console.log('- Subtraction Level 1 & 2');
    console.log('- Multiplication Level 1 & 2');
    console.log('- Division Level 1 & 2\n');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Delete activities 9-72? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        const [result] = await connection.query(`
          DELETE FROM activity WHERE activity_id >= 9 AND activity_id <= 72
        `);
        console.log(`\n✓ Deleted ${result.affectedRows} activities and their questions`);
        console.log('✅ Now you only have Addition Level 1 & 2!');
      } else {
        console.log('Cancelled.');
      }
      readline.close();
      await connection.end();
    });
    
  } catch (error) {
    console.error('Error:', error);
    await connection.end();
  }
}

simplifyTo2Levels().catch(console.error);
