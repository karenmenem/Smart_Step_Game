const mysql = require('mysql2/promise');

async function createIntermediateLevel1() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Creating Addition Intermediate Level 1 ===\n');
    
    // Check if activity 10 already exists
    const [existing] = await connection.query(
      'SELECT * FROM activity WHERE activity_id = 10'
    );
    
    if (existing && existing.length > 0) {
      console.log('✅ Addition Intermediate Level 1 (Activity ID 10) already exists!');
      console.log('Name:', existing[0].name);
      console.log('Description:', existing[0].description);
      
      // Check how many questions it has
      const [questions] = await connection.query(
        'SELECT COUNT(*) as count FROM Question WHERE activity_id = 10'
      );
      console.log('Questions:', questions[0].count);
      
      if (questions[0].count === 0) {
        console.log('\n📝 Activity exists but has no questions. You can add questions through the admin panel.');
      }
    } else {
      console.log('❌ Activity 10 does not exist. This is strange - it should have been created earlier.');
      console.log('Let me check what activities exist...\n');
      
      const [activities] = await connection.query(
        'SELECT activity_id, name FROM activity WHERE activity_id BETWEEN 7 AND 15 ORDER BY activity_id'
      );
      
      console.log('Existing activities:');
      activities.forEach(a => console.log(`  ${a.activity_id}: ${a.name}`));
    }
    
    console.log('\n💡 To add questions:');
    console.log('1. Go to Admin Dashboard');
    console.log('2. Click "Add Question"');
    console.log('3. Select Activity: "Addition Intermediate - Level 1" (ID: 10)');
    console.log('4. Add your questions!\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createIntermediateLevel1().catch(console.error);
