const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Smart Step Learning1'
};

// ======================================
// UPDATE THESE VALUES FOR EACH QUESTION
// ======================================

const QUESTION_ID = 36;  // Change this to the question ID you want to update

const ASL_TRANSLATION = {
  sentence: "Emma read 12 books in January and 8 books in February. How many books did she read total?",
  words: [
    { word: "Emma", video: "/asl/words/emma.mp4" },
    { word: "read", video: "/asl/words/read.mp4" },
    { word: "12", video: "/asl/numbers/12.mp4" },
    { word: "books", video: "/asl/words/book.mp4" },
    { word: "in", video: "/asl/words/in.mp4" },
    { word: "January", video: "/asl/words/january.mp4" },
    { word: "and", video: "/asl/words/and.mp4" },
    { word: "8", video: "/asl/numbers/8.mp4" },
    { word: "books", video: "/asl/words/book.mp4" },
    { word: "in", video: "/asl/words/in.mp4" },
    { word: "February", video: "/asl/words/february.mp4" },
    { word: "How many", video: "/asl/words/how-many.mp4" },  // Combined into one sign
    { word: "books", video: "/asl/words/book.mp4" },
    { word: "did", video: "/asl/words/did.mp4" },
    { word: "she", video: "/asl/words/she.mp4" },
    { word: "read", video: "/asl/words/read.mp4" },
    { word: "total", video: "/asl/words/total.mp4" }
  ]
};

// ======================================
// DON'T MODIFY BELOW THIS LINE
// ======================================

async function addASLToQuestion() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Get current question info
    const [questions] = await connection.query(
      'SELECT question_id, question_text FROM Question WHERE question_id = ?',
      [QUESTION_ID]
    );
    
    if (questions.length === 0) {
      console.log(`❌ Question ID ${QUESTION_ID} not found!`);
      return;
    }
    
    console.log('\n📝 Adding ASL translation...\n');
    console.log(`Question ID: ${QUESTION_ID}`);
    console.log(`Text: ${questions[0].question_text}`);
    console.log('');
    
    // Convert to JSON string for storage
    const aslSignsJSON = JSON.stringify(ASL_TRANSLATION);
    
    // Update the question
    await connection.query(`
      UPDATE Question
      SET asl_signs = ?,
          asl_type = 'sentence'
      WHERE question_id = ?
    `, [aslSignsJSON, QUESTION_ID]);
    
    console.log('✅ ASL translation added successfully!\n');
    console.log('Word-by-word ASL mapping:');
    ASL_TRANSLATION.words.forEach((w, idx) => {
      console.log(`  ${idx + 1}. "${w.word}" → ${w.video}`);
    });
    
    const uniqueVideos = [...new Set(ASL_TRANSLATION.words.map(w => w.video))];
    console.log(`\n📊 Total words: ${ASL_TRANSLATION.words.length}`);
    console.log(`📊 Unique ASL videos needed: ${uniqueVideos.length}`);
    
    console.log('\n💡 Make sure these ASL video files exist:');
    uniqueVideos.forEach(video => {
      console.log(`  - ${video}`);
    });
    
    console.log('\n📁 Video location: backend/uploads/asl-videos/');
    console.log('   Or wherever your ASL videos are stored');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addASLToQuestion();
