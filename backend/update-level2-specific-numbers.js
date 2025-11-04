const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateLevel2WithSpecificNumbers() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'SmartStep_db'
    });

    console.log('✅ Connected to database');

    // Update Level 2 questions to use 'both' type with specific numbers in asl_signs
    const updates = [
      { id: 21, signs: [15, 12], question: '15 + 12' },
      { id: 22, signs: [23, 14], question: '23 + 14' },
      { id: 23, signs: [18, 19], question: '18 + 19' },
      { id: 24, signs: [25, 22], question: '25 + 22' },
      { id: 25, signs: [30, 17], question: '30 + 17' },
      { id: 26, signs: [12, 11], question: '12 + 11' },
      { id: 27, signs: [28, 15], question: '28 + 15' },
      { id: 28, signs: [35, 14], question: '35 + 14' },
      { id: 29, signs: [20, 29], question: '20 + 29' },
      { id: 30, signs: [16, 24], question: '16 + 24' }
    ];

    console.log('\n🔄 Updating Level 2 questions with specific ASL numbers...');

    for (const update of updates) {
      try {
        await connection.query(
          `UPDATE question 
           SET asl_signs = ?, 
               asl_type = 'both'
           WHERE question_id = ?`,
          [JSON.stringify(update.signs), update.id]
        );
        console.log(`   ✅ Updated Q${update.id}: ${update.question} → ASL signs [${update.signs.join(', ')}]`);
      } catch (err) {
        console.log(`   ❌ Error updating Q${update.id}: ${err.message}`);
      }
    }

    // Verify updates
    const [questions] = await connection.query(`
      SELECT 
        question_id,
        question_text,
        asl_signs,
        asl_type
      FROM question
      WHERE activity_id = 2
      ORDER BY order_index
    `);

    console.log('\n📊 Verified Level 2 Questions:');
    questions.forEach(q => {
      const signs = JSON.parse(q.asl_signs || '[]');
      console.log(`   ${q.question_id}. ${q.question_text}`);
      console.log(`      → Type: ${q.asl_type}, Signs: [${signs.join(', ')}]`);
    });

    console.log('\n✅ Update complete!');
    console.log('\n💡 Now each question will show:');
    console.log('   - The specific numbers as text (e.g., "15" and "12")');
    console.log('   - A demonstration video (optional)');
    console.log('   - Kids can see exactly which numbers are in the problem!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed');
    }
  }
}

updateLevel2WithSpecificNumbers()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
