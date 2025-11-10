const { query } = require('./config/database');

async function testAdminQuestions() {
  try {
    console.log('=== Testing Admin Questions Query ===\n');
    
    // Test 1: Count total questions
    const countResult = await query('SELECT COUNT(*) as count FROM question');
    console.log('1. Total questions in database:', countResult[0].count);
    
    // Test 2: Get all questions without joins
    const simpleQuestions = await query('SELECT * FROM question LIMIT 5');
    console.log('\n2. Sample questions (simple query):', simpleQuestions.length, 'found');
    if (simpleQuestions.length > 0) {
      console.log('   First question:', {
        id: simpleQuestions[0].question_id,
        text: simpleQuestions[0].question_text?.substring(0, 50) + '...',
        activity_id: simpleQuestions[0].activity_id
      });
    }
    
    // Test 3: Admin query (with joins)
    const adminQuery = `
      SELECT 
        q.*,
        a.name as activity_name,
        s.name as section_name,
        s.level,
        sub.name as subject_name
      FROM question q
      JOIN activity a ON q.activity_id = a.activity_id
      JOIN section s ON a.section_id = s.section_id
      JOIN subject sub ON s.subject_id = sub.subject_id
      ORDER BY sub.name, s.level, a.order_index, q.order_index
      LIMIT 5
    `;
    
    console.log('\n3. Testing admin query (with joins)...');
    const adminQuestions = await query(adminQuery);
    console.log('   Result:', adminQuestions.length, 'questions found');
    
    if (adminQuestions.length > 0) {
      console.log('   First question:', {
        id: adminQuestions[0].question_id,
        text: adminQuestions[0].question_text?.substring(0, 50) + '...',
        subject: adminQuestions[0].subject_name,
        activity: adminQuestions[0].activity_name,
        level: adminQuestions[0].level
      });
    } else {
      console.log('   ❌ No questions returned from admin query!');
      console.log('\n4. Checking if joins are the problem...');
      
      // Check activities
      const activities = await query('SELECT COUNT(*) as count FROM activity');
      console.log('   Activities in DB:', activities[0].count);
      
      // Check sections
      const sections = await query('SELECT COUNT(*) as count FROM section');
      console.log('   Sections in DB:', sections[0].count);
      
      // Check subjects
      const subjects = await query('SELECT COUNT(*) as count FROM subject');
      console.log('   Subjects in DB:', subjects[0].count);
      
      // Check if questions have valid activity_id
      const orphanQuestions = await query(`
        SELECT COUNT(*) as count 
        FROM question q 
        LEFT JOIN activity a ON q.activity_id = a.activity_id 
        WHERE a.activity_id IS NULL
      `);
      console.log('   Questions with invalid activity_id:', orphanQuestions[0].count);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAdminQuestions();
