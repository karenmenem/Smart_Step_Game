const mysql = require('mysql2/promise');

async function createIntermediateL1Questions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Creating Addition Intermediate Level 1 Questions ===\n');
    
    const questions = [
      {
        text: "What is 15 + 12? 🧮",
        answer: "27",
        options: ["27", "25", "28", "26"],
        asl_signs: [15, "plus", 12]
      },
      {
        text: "What is 23 + 14? 🎯",
        answer: "37",
        options: ["37", "35", "38", "36"],
        asl_signs: [23, "plus", 14]
      },
      {
        text: "What is 18 + 16? 📊",
        answer: "34",
        options: ["34", "32", "35", "33"],
        asl_signs: [18, "plus", 16]
      },
      {
        text: "What is 25 + 20? 💡",
        answer: "45",
        options: ["45", "44", "46", "43"],
        asl_signs: [25, "plus", 20]
      },
      {
        text: "What is 17 + 19? ⭐",
        answer: "36",
        options: ["36", "35", "37", "34"],
        asl_signs: [17, "plus", 19]
      },
      {
        text: "What is 22 + 13? 🎨",
        answer: "35",
        options: ["35", "34", "36", "33"],
        asl_signs: [22, "plus", 13]
      },
      {
        text: "What is 28 + 11? 🌟",
        answer: "39",
        options: ["39", "38", "40", "37"],
        asl_signs: [28, "plus", 11]
      },
      {
        text: "What is 16 + 24? 🏆",
        answer: "40",
        options: ["40", "39", "41", "38"],
        asl_signs: [16, "plus", 24]
      },
      {
        text: "What is 19 + 21? ✨",
        answer: "40",
        options: ["40", "39", "41", "42"],
        asl_signs: [19, "plus", 21]
      },
      {
        text: "What is 27 + 18? 🎉",
        answer: "45",
        options: ["45", "44", "46", "43"],
        asl_signs: [27, "plus", 18]
      }
    ];
    
    console.log(`Creating ${questions.length} questions for Activity 10 (Addition Intermediate L1)...\n`);
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      await connection.query(`
        INSERT INTO Question 
        (activity_id, question_text, question_type, correct_answer, options, asl_signs, asl_type, difficulty_level, points_value, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        10, // Activity ID for Addition Intermediate L1
        q.text,
        'multiple_choice',
        q.answer,
        JSON.stringify(q.options),
        JSON.stringify(q.asl_signs),
        'numbers',
        2, // Intermediate difficulty
        10, // 10 points per question
        i
      ]);
      
      console.log(`✓ Question ${i + 1}: ${q.text}`);
    }
    
    console.log('\n✅ All 10 questions created successfully!');
    console.log('🎯 Addition Intermediate Level 1 is now ready to play!\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createIntermediateL1Questions().catch(console.error);
