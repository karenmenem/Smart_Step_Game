const db = require('./config/database');

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database...');
    
    // Try to select from asl_resources
    try {
      const total = await db.query("SELECT COUNT(*) as count FROM asl_resources");
      console.log('✅ Table exists! Total records:', total[0]?.count || 0);
      
      const words = await db.query("SELECT COUNT(*) as count FROM asl_resources WHERE type = 'word'");
      const numbers = await db.query("SELECT COUNT(*) as count FROM asl_resources WHERE type = 'number'");
      const operations = await db.query("SELECT COUNT(*) as count FROM asl_resources WHERE type = 'operation'");

      console.log('\n📊 ASL Resources in Database:');
      console.log('  Words:', words[0]?.count || 0);
      console.log('  Numbers:', numbers[0]?.count || 0);
      console.log('  Operations:', operations[0]?.count || 0);

      // Show samples
      if ((total[0]?.count || 0) > 0) {
        console.log('\n📝 Sample entries:');
        const sampleWords = await db.query("SELECT value FROM asl_resources WHERE type = 'word' LIMIT 5");
        const sampleNumbers = await db.query("SELECT value FROM asl_resources WHERE type = 'number' LIMIT 5");
        const sampleOps = await db.query("SELECT value FROM asl_resources WHERE type = 'operation'");
        
        if (sampleWords.length > 0) console.log('  Words:', sampleWords.map(r => r.value).join(', '));
        if (sampleNumbers.length > 0) console.log('  Numbers:', sampleNumbers.map(r => r.value).join(', '));
        if (sampleOps.length > 0) console.log('  Operations:', sampleOps.map(r => r.value).join(', '));
      }
    } catch (e) {
      console.log('❌ Table asl_resources does not exist or error occurred');
      console.log('Error:', e.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();
