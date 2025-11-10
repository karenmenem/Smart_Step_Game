const { query } = require('./config/database');
const fs = require('fs').promises;
const path = require('path');

const ASL_WORDS_DIR = path.join(__dirname, '../frontend/public/asl/words');

async function getAvailableWords() {
  try {
    const files = await fs.readdir(ASL_WORDS_DIR);
    return files
      .filter(f => f.endsWith('.mp4'))
      .map(f => f.replace('.mp4', ''));
  } catch (error) {
    console.log('⚠️  Words directory not found');
    return [];
  }
}

function mapQuestionToASL(questionText, availableWords) {
  // Clean and split the question into words
  const words = questionText
    .toLowerCase()
    .replace(/[?!.,]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(w => w.length > 0);
  
  const aslWords = [];
  const missingWords = [];
  
  words.forEach(word => {
    // Check if word or its variations exist
    if (availableWords.includes(word)) {
      aslWords.push(word);
    } else if (availableWords.includes(word.replace(/-/g, ''))) {
      // Try without hyphens
      aslWords.push(word.replace(/-/g, ''));
    } else {
      // Word not found
      aslWords.push(word); // Still include it for fingerspelling
      missingWords.push(word);
    }
  });
  
  return { aslWords, missingWords };
}

async function addASLToComprehension() {
  try {
    console.log('🎨 Adding ASL to Comprehension questions...\n');
    
    // Get available word videos
    const availableWords = await getAvailableWords();
    console.log(`📹 Found ${availableWords.length} word videos\n`);
    
    // Get all comprehension questions (activity 43)
    const questions = await query(
      'SELECT question_id, question_text FROM question WHERE activity_id = 43 ORDER BY question_id'
    );
    
    console.log(`Found ${questions.length} comprehension questions\n`);
    
    let successCount = 0;
    let partialCount = 0;
    
    for (const q of questions) {
      const mapping = mapQuestionToASL(q.question_text, availableWords);
      
      // Update question with ASL data
      await query(
        `UPDATE question 
         SET asl_signs = ?, asl_type = 'sentence' 
         WHERE question_id = ?`,
        [JSON.stringify(mapping.aslWords), q.question_id]
      );
      
      if (mapping.missingWords.length === 0) {
        console.log(`✅ Q${q.question_id}: "${q.question_text}" - All words found!`);
        successCount++;
      } else {
        console.log(`⚠️  Q${q.question_id}: "${q.question_text}"`);
        console.log(`   Missing: ${mapping.missingWords.join(', ')}`);
        partialCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Complete: ${successCount} questions`);
    console.log(`⚠️  Partial: ${partialCount} questions (some words missing)`);
    console.log('='.repeat(60));
    
    if (partialCount > 0) {
      console.log('\n💡 Tip: Missing words will be fingerspelled or shown as text');
      console.log('   Add more word videos to improve ASL coverage');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addASLToComprehension();
