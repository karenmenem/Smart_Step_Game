const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Smart Step Learning1'
};

async function addASLForEmmaQuestion() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('\n📝 Adding ASL translation for Emma books question...\n');
    
    // Your ASL translation for the sentence
    // Format: word-by-word ASL signs
    const aslTranslation = {
      sentence: "Emma read 12 books in January and 8 books in February. How many books did she read total?",
      words: [
        { word: "Emma", sign: "EMMA" },
        { word: "read", sign: "READ" },
        { word: "12", sign: "12" },
        { word: "books", sign: "BOOK" },
        { word: "in", sign: "IN" },
        { word: "January", sign: "JANUARY" },
        { word: "and", sign: "AND" },
        { word: "8", sign: "8" },
        { word: "books", sign: "BOOK" },
        { word: "in", sign: "IN" },
        { word: "February", sign: "FEBRUARY" },
        { word: "How", sign: "HOW" },
        { word: "many", sign: "MANY" },
        { word: "books", sign: "BOOK" },
        { word: "did", sign: "PAST" },
        { word: "she", sign: "SHE" },
        { word: "read", sign: "READ" },
        { word: "total", sign: "TOTAL" }
      ]
    };
    
    // Convert to JSON string for storage
    const aslSignsJSON = JSON.stringify(aslTranslation);
    
    // Update the question with ASL translation
    await connection.query(`
      UPDATE Question
      SET asl_signs = ?,
          asl_type = 'sentence'
      WHERE question_id = 36
    `, [aslSignsJSON]);
    
    console.log('✅ ASL translation added successfully!\n');
    console.log('Question ID: 36');
    console.log('ASL Type: sentence');
    console.log('Words with ASL signs:');
    aslTranslation.words.forEach(w => {
      console.log(`  ${w.word} → ${w.sign}`);
    });
    
    console.log('\n📌 Next step: Make sure you have ASL video files for:');
    const uniqueSigns = [...new Set(aslTranslation.words.map(w => w.sign))];
    uniqueSigns.forEach(sign => {
      console.log(`  - ${sign.toLowerCase()}.mp4`);
    });
    
    console.log('\n💡 Videos should be in: backend/uploads/asl-videos/');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addASLForEmmaQuestion();
