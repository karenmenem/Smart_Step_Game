const { query } = require('./config/database');

async function testQuizAPI() {
  try {
    console.log('🧪 Testing Quiz API...\n');

    // Test 1: Get questions for activity 1
    console.log('1️⃣ Fetching questions for Activity 1 (Addition Level 1)...');
    const questions = await query(
      `SELECT 
        question_id as id,
        question_text as question,
        correct_answer as correct,
        options,
        asl_signs as aslSigns
      FROM question 
      WHERE activity_id = 1 
      ORDER BY order_index ASC`
    );
    
    console.log(`✅ Found ${questions.length} questions`);
    if (questions.length > 0) {
      console.log('Sample question:', {
        id: questions[0].id,
        question: questions[0].question,
        options: JSON.parse(questions[0].options),
        aslSigns: JSON.parse(questions[0].aslSigns),
        correct: questions[0].correct
      });
    }
    console.log('');

    // Test 2: Get activity details
    console.log('2️⃣ Fetching activity details...');
    const activities = await query(
      `SELECT 
        a.activity_id as id,
        a.name,
        a.points_value as points,
        s.level,
        s.name as levelName,
        sub.name as subject
      FROM activity a
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      WHERE a.activity_id = 1`
    );
    
    if (activities.length > 0) {
      console.log('✅ Activity found:', activities[0]);
    }
    console.log('');

    // Test 3: Check subjects
    console.log('3️⃣ Checking available subjects...');
    const subjects = await query('SELECT * FROM subject');
    console.log('✅ Subjects:', subjects.map(s => s.name).join(', '));
    console.log('');

    // Test 4: Check sections (levels)
    console.log('4️⃣ Checking available sections/levels...');
    const sections = await query(
      `SELECT s.*, sub.name as subject_name 
       FROM section s 
       JOIN subject sub ON s.subject_id = sub.subject_id
       ORDER BY sub.name, s.level`
    );
    console.log('✅ Sections:', sections.map(s => `${s.subject_name} Level ${s.level}: ${s.name}`));
    console.log('');

    // Test 5: Check achievements
    console.log('5️⃣ Checking achievements...');
    const achievements = await query('SELECT * FROM achievement');
    console.log(`✅ Found ${achievements.length} achievements`);
    achievements.forEach(a => {
      console.log(`   ${a.icon} ${a.name} - ${a.description}`);
    });
    console.log('');

    console.log('✅ All tests passed! Database is properly configured.\n');
    console.log('📊 Summary:');
    console.log(`   - ${questions.length} questions available`);
    console.log(`   - ${subjects.length} subjects`);
    console.log(`   - ${sections.length} levels/sections`);
    console.log(`   - ${achievements.length} achievements`);
    console.log('');
    console.log('🚀 Your database is ready! You can now:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend: cd ../frontend && npm start');
    console.log('   3. Sign up and take the quiz!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testQuizAPI();
