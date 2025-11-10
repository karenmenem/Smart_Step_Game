const { query } = require('./config/database');
const fs = require('fs').promises;
const path = require('path');

// ASL video directories
const ASL_DIRS = {
  numbers: path.join(__dirname, '../frontend/public/asl/numbers'),
  words: path.join(__dirname, '../frontend/public/asl/words'),
  operations: path.join(__dirname, '../frontend/public/asl/operations')
};

async function getAvailableASLVideos() {
  const videos = { numbers: [], words: [], operations: [] };
  
  for (const [type, dir] of Object.entries(ASL_DIRS)) {
    try {
      const files = await fs.readdir(dir);
      videos[type] = files
        .filter(f => f.endsWith('.mp4'))
        .map(f => f.replace('.mp4', ''));
    } catch (error) {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  }
  
  return videos;
}

function mapQuestionToASL(questionText, availableVideos) {
  // Extract numbers and operation from question (e.g., "5 - 2 = ?")
  const match = questionText.match(/(\d+)\s*-\s*(\d+)/);
  
  if (!match) return null;
  
  const num1 = match[1];
  const num2 = match[2];
  
  // Return array of numbers and operations (not paths)
  const aslSigns = [parseInt(num1), 'minus', parseInt(num2), 'equals'];
  const missingVideos = [];
  
  // Check which videos are missing
  if (!availableVideos.numbers.includes(num1)) {
    missingVideos.push(`${num1}.mp4 (numbers)`);
  }
  if (!availableVideos.operations.includes('minus')) {
    missingVideos.push('minus.mp4 (operations)');
  }
  if (!availableVideos.numbers.includes(num2)) {
    missingVideos.push(`${num2}.mp4 (numbers)`);
  }
  if (!availableVideos.operations.includes('equals')) {
    missingVideos.push('equals.mp4 (operations)');
  }
  
  return { aslSigns, missingVideos };
}

async function addASLToQuestions() {
  try {
    console.log('🎨 Adding ASL to Subtraction Beginner L1 questions...\n');
    
    // Get available ASL videos
    const availableVideos = await getAvailableASLVideos();
    console.log(`📹 Found ${availableVideos.numbers.length} number videos`);
    console.log(`📹 Found ${availableVideos.operations.length} operation videos`);
    console.log(`📹 Found ${availableVideos.words.length} word videos\n`);
    
    // Get questions (IDs 154-163)
    const questions = await query(
      'SELECT question_id, question_text FROM question WHERE question_id BETWEEN 154 AND 163 ORDER BY question_id'
    );
    
    console.log(`Found ${questions.length} questions to process\n`);
    
    let successCount = 0;
    let partialCount = 0;
    
    for (const q of questions) {
      const mapping = mapQuestionToASL(q.question_text, availableVideos);
      
      if (!mapping) {
        console.log(`❌ Question ${q.question_id}: Could not parse "${q.question_text}"`);
        continue;
      }
      
      // Update question with ASL data
      await query(
        `UPDATE question 
         SET asl_signs = ?, asl_type = 'numbers' 
         WHERE question_id = ?`,
        [JSON.stringify(mapping.aslSigns), q.question_id]
      );
      
      if (mapping.missingVideos.length === 0) {
        console.log(`✅ Question ${q.question_id}: "${q.question_text}" - All ASL videos found!`);
        successCount++;
      } else {
        console.log(`⚠️  Question ${q.question_id}: "${q.question_text}" - Missing: ${mapping.missingVideos.join(', ')}`);
        partialCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Complete: ${successCount} questions`);
    console.log(`⚠️  Partial: ${partialCount} questions (some videos missing)`);
    console.log('='.repeat(60));
    
    if (partialCount > 0) {
      console.log('\n💡 Tip: Download missing videos and place them in:');
      console.log('   - frontend/public/asl/numbers/');
      console.log('   - frontend/public/asl/operations/');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addASLToQuestions();
