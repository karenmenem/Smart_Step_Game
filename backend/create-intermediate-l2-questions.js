const mysql = require('mysql2/promise');

async function createIntermediateL2Questions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Creating Addition Intermediate Level 2 Questions ===\n');
    
    // Activity 11 is Addition Intermediate Level 2
    const activityId = 11;
    
    const questions = [
      {
        text: "Tom had 10 stickers. He bought 15 more, then bought 8 more. How many stickers does he have now?",
        options: ["33", "25", "43", "23"],
        correct: 0
      },
      {
        text: "Sarah collected 12 coins. Her friend gave her 18 coins, then she found 7 more. How many coins does she have in total?",
        options: ["37", "47", "27", "30"],
        correct: 0
      },
      {
        text: "A baker made 20 cookies. He made 14 more, then made 11 more. How many cookies did he make altogether?",
        options: ["35", "45", "55", "34"],
        correct: 1
      },
      {
        text: "Emma read 15 pages. Then she read 22 pages, and then 13 pages. How many pages did she read in total?",
        options: ["40", "50", "60", "45"],
        correct: 1
      },
      {
        text: "David scored 18 points in the first round. He scored 16 points in the second round, and 19 points in the third round. What is his total score?",
        options: ["43", "53", "63", "48"],
        correct: 1
      },
      {
        text: "A store sold 25 toys on Monday. They sold 17 toys on Tuesday, and 21 toys on Wednesday. How many toys were sold in total?",
        options: ["53", "63", "73", "58"],
        correct: 1
      },
      {
        text: "Lisa has 14 dollars. She earned 23 dollars, then earned 16 more dollars. How much money does she have now?",
        options: ["43", "53", "63", "47"],
        correct: 1
      },
      {
        text: "A farmer picked 22 apples. He picked 19 more apples, then picked 14 more. How many apples did he pick altogether?",
        options: ["45", "55", "65", "50"],
        correct: 1
      },
      {
        text: "Mark had 17 marbles. He got 20 marbles from his friend, then won 18 more. How many marbles does he have now?",
        options: ["45", "55", "65", "50"],
        correct: 1
      },
      {
        text: "A library had 28 books. They received 24 new books, then received 13 more books. How many books do they have in total?",
        options: ["55", "65", "75", "60"],
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
    
    console.log('\n✅ All 10 questions created successfully!');
    console.log('\n💡 These questions involve adding 3 numbers (multi-step problems)');
    console.log('💡 Numbers range from 7-28, totals from 33-65');
    console.log('💡 Designed to be solvable in 30 seconds\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createIntermediateL2Questions().catch(console.error);
