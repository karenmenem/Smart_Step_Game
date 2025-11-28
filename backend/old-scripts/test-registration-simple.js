const { query, testConnection } = require('./config/database');

async function testRegistration() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful');
    
    // Test parent insertion
    console.log('\nTesting parent insertion...');
    const testEmail = `test-${Date.now()}@example.com`;
    const parentResult = await query(
      'INSERT INTO parent (email, password) VALUES (?, ?)',
      [testEmail, 'hashed-password-test']
    );
    console.log('✅ Parent inserted with ID:', parentResult.insertId);
    
    // Test child insertion
    console.log('\nTesting child insertion...');
    const childResult = await query(
      'INSERT INTO child (parent_id, name, age, current_math_level, current_english_level) VALUES (?, ?, ?, 1, 1)',
      [parentResult.insertId, 'Test Child', 8]
    );
    console.log('✅ Child inserted with ID:', childResult.insertId);
    
    // Clean up test data
    await query('DELETE FROM parent WHERE parent_id = ?', [parentResult.insertId]);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Registration flow test PASSED!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Registration test FAILED:', error);
    process.exit(1);
  }
}

testRegistration();