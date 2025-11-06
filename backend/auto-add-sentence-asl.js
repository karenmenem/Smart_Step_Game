/**
 * Automatically add ASL translation support to sentence-based questions
 * 
 * This script:
 * 1. Finds all English/comprehension questions
 * 2. Sets asl_type to 'sentence' for automatic translation
 * 3. The frontend will automatically translate each word to ASL
 */

const { query } = require('./config/database');

async function addSentenceASL() {
  try {
    console.log('🔍 Finding sentence-based questions...\n');
    
    // Get all questions that are text-based (not math)
    const questions = await query(`
      SELECT q.*, a.activity_name, s.section_name
      FROM Question q
      JOIN Activity a ON q.activity_id = a.activity_id
      JOIN Section s ON a.section_id = s.section_id
      WHERE s.subject_id = 2
      AND (q.asl_type IS NULL OR q.asl_type = 'none')
      ORDER BY q.question_id
    `);
    
    console.log(`📚 Found ${questions.length} English questions without ASL\n`);
    
    if (questions.length === 0) {
      console.log('✅ All questions already have ASL support!');
      return;
    }
    
    // Update each question to enable automatic sentence translation
    for (const q of questions) {
      // For demonstration, let's just mark them for sentence translation
      await query(`
        UPDATE Question 
        SET asl_type = 'sentence'
        WHERE question_id = ?
      `, [q.question_id]);
      
      console.log(`✅ Q${q.question_id}: "${q.question_text}"`);
      console.log(`   → Set to sentence translation mode\n`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Updated ${questions.length} questions for ASL sentence translation!`);
    console.log('\n📝 How it works:');
    console.log('   1. When a question is displayed, the ASL Player automatically appears');
    console.log('   2. The system breaks the sentence into words');
    console.log('   3. For each word with an ASL video in /public/asl/words/, it plays the video');
    console.log('   4. For words without videos, it shows the word as text (you can add videos later)');
    console.log('\n🎬 To add ASL videos for words:');
    console.log('   1. Download ASL videos for common words (apple, eat, tom, etc.)');
    console.log('   2. Place them in: frontend/public/asl/words/');
    console.log('   3. Name them: wordname.mp4 (e.g., apple.mp4, tom.mp4, eat.mp4)');
    console.log('   4. The system will automatically use them!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// You can also manually test sentence translation
async function testSentenceTranslation() {
  console.log('\n🧪 Testing sentence translation...\n');
  
  const testSentences = [
    'Tom ate an apple',
    'The cat sat on the mat',
    'I love reading books'
  ];
  
  for (const sentence of testSentences) {
    console.log(`📝 Sentence: "${sentence}"`);
    const words = sentence.toLowerCase()
      .replace(/[.,!?]/g, '')
      .split(/\s+/);
    
    console.log(`   Words: [${words.join(', ')}]`);
    console.log(`   ASL videos needed:`);
    for (const word of words) {
      console.log(`      - /asl/words/${word}.mp4`);
    }
    console.log('');
  }
}

// Run the script
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║   ASL Sentence Translation Setup                    ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

addSentenceASL();
