const { testConnection, query } = require('./config/database');

async function testChildInsert() {
  try {
    console.log('Testing child table operations...');
    await testConnection();
    
    // First insert a parent
    const testEmail = `childtest_${Date.now()}@test.com`;
    const parentResult = await query(
      'INSERT INTO parent (email, password) VALUES (?, ?)', 
      [testEmail, 'hashedpass']
    );
    
    console.log('✅ Parent inserted, ID:', parentResult.insertId);
    
    // Now try child insert with exact same query as registration
    console.log('Testing child insert...');
    const childResult = await query(
      'INSERT INTO child (parent_id, name, age, current_math_level, current_english_level, profile_picture) VALUES (?, ?, ?, 1, 1, ?)',
      [parentResult.insertId, 'Test Child', 8, null]
    );
    
    console.log('✅ Child insert successful, ID:', childResult.insertId);
    
    // Clean up
    await query('DELETE FROM child WHERE child_id = ?', [childResult.insertId]);
    await query('DELETE FROM parent WHERE parent_id = ?', [parentResult.insertId]);
    console.log('✅ Cleanup successful');
    
  } catch (error) {
    console.error('❌ Child insert error:', error.message);
    console.error('SQL State:', error.sqlState);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

testChildInsert();