const mysql = require('mysql2/promise');

async function createAdvancedL1Questions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Creating Addition Advanced Level 1 Questions (Numbers) ===\n');
    
    // Activity 13 is Addition Advanced Level 1
    const activityId = 13;
    
    const questions = [
      {
        text: "35 + 27",
        options: ["52", "62", "72", "82"],
        correct: 1
      },
      {
        text: "48 + 36",
        options: ["74", "84", "94", "64"],
        correct: 1
      },
      {
        text: "42 + 39",
        options: ["71", "81", "91", "61"],
        correct: 1
      },
      {
        text: "30 + 25 + 18",
        options: ["63", "73", "83", "53"],
        correct: 1
      },
      {
        text: "44 + 29",
        options: ["63", "73", "83", "93"],
        correct: 1
      },
      {
        text: "37 + 45",
        options: ["72", "82", "92", "62"],
        correct: 1
      },
      {
        text: "20 + 15 + 12 + 9",
        options: ["46", "56", "66", "76"],
        correct: 1
      },
      {
        text: "49 + 33",
        options: ["72", "82", "92", "62"],
        correct: 1
      },
      {
        text: "41 + 38",
        options: ["69", "79", "89", "99"],
        correct: 1
      },
      {
        text: "32 + 28 + 16",
        options: ["66", "76", "86", "96"],
        correct: 1
      }
    ];
    
    console.log(`Creating ${questions.length} questions for Activity ${activityId}...\n`);
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const query = `
        INSERT INTO Question (
          activity_id, 
          question_text, 
          question_type,
          options, 
          correct_answer, 
          asl_signs,
          points_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const options = JSON.stringify(q.options);
      const correctAnswer = q.options[q.correct];
      const aslSigns = JSON.stringify([]); // Will be added later using auto-add-asl.js
      
      await connection.query(query, [
        activityId,
        q.text,
        'multiple_choice',
        options,
        correctAnswer,
        aslSigns,
        10
      ]);
      
      console.log(`✅ Question ${i + 1}: ${q.text}`);
    }
    
    console.log('\n✅ All 10 Advanced Level 1 questions created successfully!');
    console.log('💡 These are number-only questions with larger values (27-50)');
    console.log('💡 Some questions add 3-4 numbers for extra challenge\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createAdvancedL1Questions().catch(console.error);
