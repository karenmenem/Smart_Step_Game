const { testConnection, query } = require('./config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    await testConnection();
    
    console.log('📋 Checking tables...');
    const tables = await query('SHOW TABLES');
    console.log('Tables found:', tables.map(t => Object.values(t)[0]));
    
    if (tables.length === 0) {
      console.log('❌ No tables found! Database schema needs to be imported.');
      return;
    }
    
    console.log('🔍 Checking parent table structure...');
    const parentCols = await query('DESCRIBE parent');
    console.log('Parent columns:', parentCols.map(c => `${c.Field}(${c.Type})`));
    
    console.log('🔍 Checking child table structure...');
    const childCols = await query('DESCRIBE child');
    console.log('Child columns:', childCols.map(c => `${c.Field}(${c.Type})`));
    
    console.log('✅ Database structure looks good!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('Full error:', error);
  }
}

checkDatabase();