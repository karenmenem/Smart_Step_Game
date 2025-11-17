const mysql = require('mysql2/promise');

async function showQuestionIds() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    const [questions] = await connection.query(
      'SELECT question_id, question_text FROM Question WHERE activity_id = 11 ORDER BY question_id'
    );
    
    console.log('\n=== Addition Intermediate Level 2 Question IDs ===\n');
    questions.forEach((q, i) => {
      console.log(`Question ID ${q.question_id}: ${q.question_text.substring(0, 60)}...`);
    });
    console.log(`\n✅ Found ${questions.length} questions\n`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

showQuestionIds().catch(console.error);
