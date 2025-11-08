const mysql = require('mysql2/promise');

async function checkIntermediateL2() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Checking Addition Intermediate Level 2 ===\n');
    
    // Check activity 11
    const [activity] = await connection.query(
      'SELECT * FROM activity WHERE activity_id = 11'
    );
    
    if (activity && activity.length > 0) {
      console.log('✅ Activity found:');
      console.log(`   ID: ${activity[0].activity_id}`);
      console.log(`   Name: ${activity[0].name}`);
      console.log(`   Description: ${activity[0].description}`);
      
      // Check questions
      const [questions] = await connection.query(
        'SELECT COUNT(*) as count FROM Question WHERE activity_id = 11'
      );
      console.log(`   Current questions: ${questions[0].count}`);
    } else {
      console.log('❌ Activity 11 not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkIntermediateL2().catch(console.error);
