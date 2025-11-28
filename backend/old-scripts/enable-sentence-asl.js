const { query } = require('./config/database');

async function enableSentenceASL() {
  try {
    console.log('🔧 Enabling Sentence ASL Translation...\n');
    
    // Step 1: Update database schema to support 'sentence' type
    console.log('1. Updating database schema...');
    await query(`
      ALTER TABLE Question 
      MODIFY COLUMN asl_type ENUM('numbers', 'video', 'images', 'both', 'none', 'sentence') 
      DEFAULT 'none'
    `);
    console.log('   ✅ Added "sentence" option to asl_type\n');
    
    // Step 2: Update Tom question to use sentence translation
    console.log('2. Updating Tom word problem...');
    await query(`
      UPDATE Question 
      SET asl_type = 'sentence',
          asl_signs = NULL
      WHERE activity_id = 8 
      AND question_text LIKE '%Tom went to%'
    `);
    console.log('   ✅ Set to sentence translation mode\n');
    
    // Step 3: Verify the update
    const tom = await query(`
      SELECT question_text, asl_type 
      FROM Question 
      WHERE activity_id = 8 AND question_text LIKE '%Tom%'
    `);
    
    if (tom.length > 0) {
      console.log('3. Verification:');
      console.log(`   Question: ${tom[0].question_text.substring(0, 60)}...`);
      console.log(`   ASL Type: ${tom[0].asl_type}`);
      console.log('');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Success! Sentence ASL is now enabled!\n');
    console.log('🎬 How it works:');
    console.log('   - Question will be split into words');
    console.log('   - Each word gets its own ASL video');
    console.log('   - Students can play through word-by-word');
    console.log('');
    console.log('📥 Words needed for Tom question:');
    const words = ['tom', 'went', 'to', 'the', 'store', 'and', 'bought', 
                   'apples', 'later', 'his', 'friend', 'gave', 'him', 
                   'more', 'how', 'many', 'does', 'have', 'now'];
    words.forEach(w => console.log(`   - ${w}.mp4`));
    console.log('');
    console.log('💡 Common words (the, to, and, his, how, many, etc.)');
    console.log('   may already be in /frontend/public/asl/words/');
    console.log('   from the auto-download script!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

enableSentenceASL();
