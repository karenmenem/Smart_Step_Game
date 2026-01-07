const db = require('./config/database');

// Multiplication will use activity IDs 70-77 (new range)
// Beginner L1: 70, Beginner L2: 71
// Intermediate L1: 73, Intermediate L2: 74
// Advanced L1: 76, Advanced L2: 77

const multiplicationQuestions = [
  {
    activity_id: 70,
    question_text: "What is 2 × 3?",
    correct_answer: "6",
    wrong_answers: ["5", "8", "4"],
    difficulty: "beginner"
  },
  {
    activity_id: 70,
    question_text: "What is 1 × 5?",
    correct_answer: "5",
    wrong_answers: ["4", "6", "3"],
    difficulty: "beginner"
  },
  {
    activity_id: 70,
    question_text: "What is 3 × 2?",
    correct_answer: "6",
    wrong_answers: ["5", "7", "4"],
    difficulty: "beginner"
  },
  {
    activity_id: 70,
    question_text: "What is 2 × 4?",
    correct_answer: "8",
    wrong_answers: ["6", "10", "7"],
    difficulty: "beginner"
  },
  {
    activity_id: 70,
    question_text: "What is 5 × 2?",
    correct_answer: "10",
    wrong_answers: ["8", "12", "7"],
    difficulty: "beginner"
  },
  {
    activity_id: 70,
    question_text: "What is 3 × 3?",
    correct_answer: "9",
    wrong_answers: ["6", "12", "8"],
    difficulty: "beginner"
  },
  {
    activity_id: 70,
    question_text: "What is 2 × 5?",
    correct_answer: "10",
    wrong_answers: ["8", "12", "7"],
    difficulty: "beginner"
  },
  {
    activity_id: 70,
    question_text: "What is 4 × 2?",
    correct_answer: "8",
    wrong_answers: ["6", "10", "7"],
    difficulty: "beginner"
  },
  {
    activity_id: 70,
    question_text: "What is 1 × 7?",
    correct_answer: "7",
    wrong_answers: ["6", "8", "5"],
    difficulty: "beginner"
  },
  {
    activity_id: 70,
    question_text: "What is 2 × 2?",
    correct_answer: "4",
    wrong_answers: ["3", "5", "6"],
    difficulty: "beginner"
  }
];

async function addQuestions() {
  try {
    console.log('Adding Multiplication Beginner Level 1 questions...\n');
    
    for (const q of multiplicationQuestions) {
      // Create options array with all answers
      const wrongAnswers = q.wrong_answers || [];
      const options = [q.correct_answer].concat(wrongAnswers);
      // Shuffle the options
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
      
      await db.query(`
        INSERT INTO question 
        (activity_id, question_text, question_type, correct_answer, options, difficulty_level, points_value)
        VALUES (?, ?, 'multiple_choice', ?, ?, 1, 10)
      `, [
        q.activity_id,
        q.question_text,
        q.correct_answer,
        JSON.stringify(shuffledOptions)
      ]);
      
      console.log(`✓ Added: ${q.question_text} = ${q.correct_answer}`);
    }
    
    console.log('\n✅ Successfully added 10 multiplication questions for Beginner Level 1 (Activity ID: 70)');
    console.log('\nNote: Activity ID 70 is used for Multiplication Beginner L1');
    console.log('You may need to update the frontend to use activity ID 70 for multiplication.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding questions:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addQuestions();
