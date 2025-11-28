const { query } = require('../config/database');

async function addIsActiveColumn() {
  try {
    console.log('Adding is_active column to question table...');
    
    // Check if column already exists
    const columns = await query('SHOW COLUMNS FROM question LIKE "is_active"');
    
    if (columns.length > 0) {
      console.log('✅ Column is_active already exists');
      return;
    }
    
    // Add the column
    await query(`
      ALTER TABLE question 
      ADD COLUMN is_active TINYINT(1) DEFAULT 1 NOT NULL
      AFTER order_index
    `);
    
    console.log('✅ Added is_active column successfully');
    console.log('📝 All existing questions are now set to active (is_active=1)');
    
    // Show question count
    const total = await query('SELECT COUNT(*) as count FROM question');
    console.log(`📊 Total questions: ${total[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addIsActiveColumn();
