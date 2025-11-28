const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// ========== CONFIGURATION ==========
const QUESTION_ID = 70; // <-- CHANGE THIS to the question ID you want to add ASL for
// ===================================

async function autoAddASL() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n🤖 Auto ASL Mapper\n');
    
    // 1. Get the question
    const [questions] = await connection.query(
      'SELECT question_id, question_text FROM Question WHERE question_id = ?',
      [QUESTION_ID]
    );
    
    if (!questions || questions.length === 0) {
      console.error('❌ Question not found!');
      return;
    }
    
    const question = questions[0];
    console.log('📝 Question:', question.question_text);
    
    // 2. Get available ASL videos
    const wordsPath = path.join(__dirname, '../frontend/public/asl/words');
    const numbersPath = path.join(__dirname, '../frontend/public/asl/numbers');
    
    const wordFiles = fs.readdirSync(wordsPath).filter(f => f.endsWith('.mp4'));
    const numberFiles = fs.readdirSync(numbersPath).filter(f => f.endsWith('.mp4'));
    
    const availableWords = wordFiles.map(f => f.replace('.mp4', ''));
    const availableNumbers = numberFiles.map(f => f.replace('.mp4', ''));
    
    console.log(`\n📂 Available videos: ${availableWords.length} words, ${availableNumbers.length} numbers`);
    
    // 3. Parse question text into words
    const text = question.question_text
      .replace(/[🎨📚🎯🌟💡⭐🏆✨🎉🎁]/g, '') // Remove emojis
      .replace(/[?.!]/g, '') // Remove punctuation at end
      .trim();
    
    const words = text.split(/\s+/); // Split by spaces
    
    console.log(`\n🔤 Words to map: ${words.length}`);
    
    // 4. Map words to videos
    const aslMapping = [];
    const missing = [];
    
    for (let word of words) {
      const cleanWord = word.toLowerCase().replace(/[,?.!]/g, '');
      
      // Check if it's a number
      if (/^\d+$/.test(cleanWord)) {
        if (availableNumbers.includes(cleanWord)) {
          aslMapping.push({
            word: word,
            video: `/asl/numbers/${cleanWord}.mp4`
          });
        } else {
          missing.push(`${word} (number - no video)`);
          aslMapping.push({
            word: word,
            video: `/asl/numbers/${cleanWord}.mp4`
          });
        }
      }
      // Check for compound words (like "how many")
      else {
        const dashedWord = cleanWord.replace(/\s/g, '-');
        if (availableWords.includes(dashedWord)) {
          aslMapping.push({
            word: word,
            video: `/asl/words/${dashedWord}.mp4`
          });
        } else if (availableWords.includes(cleanWord)) {
          aslMapping.push({
            word: word,
            video: `/asl/words/${cleanWord}.mp4`
          });
        } else {
          missing.push(`${word} (word)`);
        }
      }
    }
    
    console.log('\n✅ Mapped:', aslMapping.length, 'words');
    if (missing.length > 0) {
      console.log('\n⚠️  Missing videos for:');
      missing.forEach(m => console.log('   -', m));
      console.log('\n💡 You need to add these videos to frontend/public/asl/words/ or numbers/');
    }
    
    // 5. Show preview
    console.log('\n📋 ASL Mapping Preview:');
    aslMapping.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.word} → ${item.video}`);
    });
    
    // 6. Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\n❓ Save this mapping to database? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        const aslData = {
          sentence: text,
          words: aslMapping
        };
        
        await connection.query(
          'UPDATE Question SET asl_signs = ?, asl_type = ? WHERE question_id = ?',
          [JSON.stringify(aslData), 'sentence', QUESTION_ID]
        );
        
        console.log('\n✅ ASL mapping saved to database!');
        console.log('🎥 Refresh your browser to see the ASL videos play automatically.\n');
      } else {
        console.log('\n❌ Cancelled - no changes made.\n');
      }
      
      readline.close();
      await connection.end();
    });
    
  } catch (error) {
    console.error('Error:', error);
    await connection.end();
  }
}

autoAddASL().catch(console.error);
