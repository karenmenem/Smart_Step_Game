const { testConnection, query } = require('./config/database');

async function testRegistration() {
  try {
    console.log('🔍 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection works');
    
    console.log('\n📋 Checking tables...');
    const tables = await query('SHOW TABLES');
    console.log('Tables:', tables.map(t => Object.values(t)[0]));
    
    console.log('\n🔍 Parent table structure:');
    const parentCols = await query('DESCRIBE parent');
    parentCols.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key}`);
    });
    
    console.log('\n🔍 Child table structure:');
    const childCols = await query('DESCRIBE child');
    childCols.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key}`);
    });
    
    console.log('\n🧪 Testing INSERT operations...');
    
    // Test parent insert
    const testEmail = `test_${Date.now()}@test.com`;
    console.log(`Testing parent insert with email: ${testEmail}`);
    
    try {
      const parentResult = await query(
        'INSERT INTO parent (email, password) VALUES (?, ?)',
        [testEmail, 'hashedpassword123']
      );
      console.log('✅ Parent insert successful, ID:', parentResult.insertId);
      
      // Test child insert
      console.log('Testing child insert...');
      const childResult = await query(
        'INSERT INTO child (parent_id, name, age, current_math_level, current_english_level, profile_picture) VALUES (?, ?, ?, 1, 1, ?)',
        [parentResult.insertId, 'Test Child', 8, null]
      );
      console.log('✅ Child insert successful, ID:', childResult.insertId);
      
      // Clean up test data
      await query('DELETE FROM child WHERE child_id = ?', [childResult.insertId]);
      await query('DELETE FROM parent WHERE parent_id = ?', [parentResult.insertId]);
      console.log('✅ Test data cleaned up');
      
    } catch (insertError) {
      console.error('❌ INSERT failed:', insertError.message);
      console.error('Full error:', insertError);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testRegistration();