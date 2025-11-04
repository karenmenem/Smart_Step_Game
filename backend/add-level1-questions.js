const mysql = require('mysql2/promise');

async function addLevel1Questions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });

  try {
    console.log('📝 Adding Level 1 Math Addition questions...\n');

    // Activity ID for Addition Beginner - Level 1 is 7
    const activityId = 7;

    const questions = [
      {
        question_text: 'What is 2 + 3?',
        question_type: 'multiple_choice',
        correct_answer: '5',
        options: JSON.stringify(['5', '4', '6', '7']),
        asl_type: 'none'
      },
      {
        question_text: 'What is 1 + 1?',
        question_type: 'multiple_choice',
        correct_answer: '2',
        options: JSON.stringify(['2', '3', '1', '4']),
        asl_type: 'none'
      },
      {
        question_text: 'What is 3 + 2?',
        question_type: 'multiple_choice',
        correct_answer: '5',
        options: JSON.stringify(['5', '6', '4', '3']),
        asl_type: 'none'
      },
      {
        question_text: 'What is 4 + 1?',
        question_type: 'multiple_choice',
        correct_answer: '5',
        options: JSON.stringify(['5', '4', '6', '3']),
        asl_type: 'none'
      },
      {
        question_text: 'What is 2 + 2?',
        question_type: 'multiple_choice',
        correct_answer: '4',
        options: JSON.stringify(['4', '3', '5', '2']),
        asl_type: 'none'
      },
      {
        question_text: 'What is 3 + 3?',
        question_type: 'multiple_choice',
        correct_answer: '6',
        options: JSON.stringify(['6', '5', '7', '9']),
        asl_type: 'none'
      },
      {
        question_text: 'What is 1 + 4?',
        question_type: 'multiple_choice',
        correct_answer: '5',
        options: JSON.stringify(['5', '4', '6', '3']),
        asl_type: 'none'
      },
      {
        question_text: 'What is 2 + 1?',
        question_type: 'multiple_choice',
        correct_answer: '3',
        options: JSON.stringify(['3', '2', '4', '5']),
        asl_type: 'none'
      },
      {
        question_text: 'What is 5 + 1?',
        question_type: 'multiple_choice',
        correct_answer: '6',
        options: JSON.stringify(['6', '5', '7', '4']),
        asl_type: 'none'
      },
      {
        question_text: 'What is 4 + 2?',
        question_type: 'multiple_choice',
        correct_answer: '6',
        options: JSON.stringify(['6', '5', '7', '8']),
        asl_type: 'none'
      }
    ];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const [result] = await connection.execute(
        `INSERT INTO Question (
          activity_id, question_text, question_type, correct_answer, 
          options, asl_type
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          activityId,
          q.question_text,
          q.question_type,
          q.correct_answer,
          q.options,
          q.asl_type
        ]
      );
      console.log(`  ✅ Question ${i + 1}: ${q.question_text} (ID: ${result.insertId})`);
    }

    console.log('\n✅ All 10 questions added successfully!');
    console.log('📊 Activity ID: 7 (Addition Beginner - Level 1)');

  } catch (error) {
    console.error('❌ Error adding questions:', error);
  } finally {
    await connection.end();
  }
}

addLevel1Questions();
