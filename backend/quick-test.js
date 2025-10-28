const { testConnection, query } = require('./config/database');

async function quickTest() {
  try {
    console.log('Testing database...');
    await testConnection();
    
    // Test simple parent insert
    const testEmail = `quicktest_${Date.now()}@test.com`;
    console.log('Testing parent insert...');
    
    const result = await query(
      'INSERT INTO parent (email, password) VALUES (?, ?)', 
      [testEmail, 'hashedpass']
    );
    
    console.log('✅ Parent insert successful, ID:', result.insertId);
    
    // Clean up
    await query('DELETE FROM parent WHERE parent_id = ?', [result.insertId]);
    console.log('✅ Cleanup successful');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

quickTest();