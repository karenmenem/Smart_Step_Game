const { query } = require('./config/database');

const questions = [
  {
    text: "5 - 2 = ?",
    options: ["3", "7", "2", "4"],
    correct: 0
  },
  {
    text: "8 - 3 = ?",
    options: ["6", "5", "4", "11"],
    correct: 1
  },
  {
    text: "10 - 4 = ?",
    options: ["14", "7", "6", "5"],
    correct: 2
  },
  {
    text: "7 - 1 = ?",
    options: ["8", "5", "7", "6"],
    correct: 3
  },
  {
    text: "9 - 5 = ?",
    options: ["4", "3", "5", "14"],
    correct: 0
  },
  {
    text: "6 - 2 = ?",
    options: ["8", "4", "3", "5"],
    correct: 1
  },
  {
    text: "10 - 7 = ?",
    options: ["4", "2", "3", "17"],
    correct: 2
  },
  {
    text: "8 - 6 = ?",
    options: ["14", "3", "4", "2"],
    correct: 3
  },
  {
    text: "9 - 3 = ?",
    options: ["6", "5", "7", "12"],
    correct: 0
  },
  {
    text: "7 - 4 = ?",
    options: ["11", "3", "2", "4"],
    correct: 1
  }
];

async function createQuestions() {
  try {
    console.log('Creating 10 Subtraction Beginner L1 questions...\n');
    
    const activityId = 16; // Subtraction Beginner - Level 1
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      // Insert question
      const result = await query(
        `INSERT INTO question (activity_id, question_text, question_type, options, correct_answer, points_value, difficulty_level)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          activityId,
          q.text,
          'multiple_choice',
          JSON.stringify(q.options),
          q.options[q.correct],
          10,
          1
        ]
      );
      
      console.log(`✓ Question ${i + 1} created - ID: ${result.insertId} - "${q.text}"`);
    }
    
    console.log('\n✅ All 10 questions created successfully!');
    console.log('\n🎨 Next step: Add ASL to each question using auto-add-asl.js');
    console.log('   Example: Change QUESTION_ID in auto-add-asl.js and run for each question ID');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating questions:', error);
    process.exit(1);
  }
}

createQuestions();
