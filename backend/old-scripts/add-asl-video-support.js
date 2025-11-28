const { query } = require('./config/database');

async function addAslVideoSupport() {
  try {
    console.log('🎥 Adding ASL Video Support to Database...\n');

    // Add new columns to question table
    await query(`
      ALTER TABLE question 
      ADD COLUMN IF NOT EXISTS asl_video_url VARCHAR(500) AFTER asl_signs,
      ADD COLUMN IF NOT EXISTS asl_type ENUM('numbers', 'video', 'both', 'none') DEFAULT 'numbers' AFTER asl_video_url
    `);
    
    console.log('✅ Added asl_video_url column (for YouTube/external video links)');
    console.log('✅ Added asl_type column (numbers/video/both/none)');
    
    console.log('\n📝 You can now:');
    console.log('   - Use simple number arrays for basic math (1-10)');
    console.log('   - Add YouTube video URLs for complex numbers (100+167)');
    console.log('   - Add video URLs for English text/paragraphs');
    console.log('   - Mix both approaches as needed\n');
    
    console.log('💡 Example Video Sources:');
    console.log('   - SignASL.org');
    console.log('   - Signing Savvy');
    console.log('   - Handspeak');
    console.log('   - YouTube ASL channels');
    console.log('   - Lifeprint.com (Dr. Bill Vicars)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addAslVideoSupport();
