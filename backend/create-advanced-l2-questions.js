const mysql = require('mysql2/promise');

async function createAdvancedL2Questions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Creating Addition Advanced Level 2 Questions (Word Problems) ===\n');
    
    // Activity 14 is Addition Advanced Level 2
    const activityId = 14;
    
    const questions = [
      {
        text: "A school collected 65 books in September and 58 books in October. How many books did they collect in total?",
        options: ["113", "123", "133", "103"],
        correct: 1
      },
      {
        text: "Mike had 45 dollars. He earned 32 dollars washing cars, then earned 27 dollars mowing lawns. How much money does he have now?",
        options: ["94", "104", "114", "84"],
        correct: 1
      },
      {
        text: "A bakery sold 78 cupcakes on Friday and 86 cupcakes on Saturday. How many cupcakes were sold altogether?",
        options: ["154", "164", "174", "144"],
        correct: 1
      },
      {
        text: "Sarah saved 38 dollars in May, 42 dollars in June, and 35 dollars in July. How much did she save in total?",
        options: ["105", "115", "125", "95"],
        correct: 1
      },
      {
        text: "A farmer harvested 92 tomatoes in the morning and 87 tomatoes in the afternoon. How many tomatoes did he harvest in total?",
        options: ["169", "179", "189", "159"],
        correct: 1
      },
      {
        text: "Jessica scored 54 points in round one, 48 points in round two, and 39 points in round three. What is her total score?",
        options: ["131", "141", "151", "121"],
        correct: 1
      },
      {
        text: "A library received 73 new books on Monday and 69 new books on Tuesday. How many new books did they receive altogether?",
        options: ["132", "142", "152", "122"],
        correct: 1
      },
      {
        text: "Tom collected 56 stamps. His grandmother gave him 47 more stamps, then his uncle gave him 38 stamps. How many stamps does Tom have now?",
        options: ["131", "141", "151", "121"],
        correct: 1
      },
      {
        text: "A store sold 85 shirts in week one, 79 shirts in week two, and 68 shirts in week three. How many shirts were sold in total?",
        options: ["222", "232", "242", "212"],
        correct: 1
      },
      {
        text: "Anna read 64 pages on Saturday and 77 pages on Sunday. How many pages did she read in total?",
        options: ["131", "141", "151", "161"],
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
      
      console.log(`✅ Question ${i + 1}: ${q.text.substring(0, 70)}...`);
    }
    
    console.log('\n✅ All 10 Advanced Level 2 questions created successfully!');
    console.log('💡 These are challenging word problems with numbers 32-100');
    console.log('💡 Totals reach up to 232 for maximum challenge\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createAdvancedL2Questions().catch(console.error);
