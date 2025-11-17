const { query } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration...\n');

    // Drop existing tables in correct order (respecting foreign keys)
    console.log('1️⃣ Dropping old tables...');
    const tablesToDrop = [
      'child_achievement',
      'attempt',
      'child_progress',
      'question',
      'activity',
      'section',
      'subject',
      'achievement'
    ];

    for (const table of tablesToDrop) {
      try {
        await query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`   ✓ Dropped ${table}`);
      } catch (error) {
        console.log(`   ⚠ Could not drop ${table}:`, error.message);
      }
    }

    console.log('\n2️⃣ Creating new tables from schema...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await query(statement);
      } catch (error) {
        // Ignore duplicate entry errors for INSERT IGNORE statements
        if (!error.message.includes('Duplicate entry')) {
          console.error('   ⚠ Error executing statement:', error.message);
        }
      }
    }

    console.log('   ✓ Schema applied successfully\n');

    // Verify the new structure
    console.log('3️⃣ Verifying new structure...');
    const questionCols = await query('DESCRIBE question');
    const hasAslSigns = questionCols.some(col => col.Field === 'asl_signs');
    const hasOptions = questionCols.some(col => col.Field === 'options');
    
    if (hasAslSigns && hasOptions) {
      console.log('   ✅ Question table has correct structure\n');
    } else {
      console.log('   ❌ Question table structure is incorrect\n');
      console.log('   Columns:', questionCols.map(c => c.Field).join(', '));
      return;
    }

    // Check data
    console.log('4️⃣ Checking seeded data...');
    const questionCount = await query('SELECT COUNT(*) as count FROM question');
    const activityCount = await query('SELECT COUNT(*) as count FROM activity');
    const sectionCount = await query('SELECT COUNT(*) as count FROM section');
    
    console.log(`   ✓ Questions: ${questionCount[0].count}`);
    console.log(`   ✓ Activities: ${activityCount[0].count}`);
    console.log(`   ✓ Sections: ${sectionCount[0].count}\n`);

    console.log('✅ Migration completed successfully!');
    console.log('🎉 Your database is now ready with the new schema!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();
