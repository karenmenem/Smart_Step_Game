const mysql = require('mysql2/promise');

async function addASLForMaryQuestion() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    const QUESTION_ID = 34;
    
    // "Mary has 10 stickers and her friend gives her 2 more. How many stickers does Sarah have now? 🎨"
    const ASL_TRANSLATION = {
      sentence: "Mary has 10 stickers and her friend gives her 2 more. How many stickers does Sarah have now?",
      words: [
        { word: "Mary", video: "/asl/words/mary.mp4" },
        { word: "has", video: "/asl/words/has.mp4" },
        { word: "10", video: "/asl/numbers/10.mp4" },
        { word: "stickers", video: "/asl/words/stickers.mp4" },
        { word: "and", video: "/asl/words/and.mp4" },
        { word: "her", video: "/asl/words/her.mp4" },
        { word: "friend", video: "/asl/words/friend.mp4" },
        { word: "gives", video: "/asl/words/gives.mp4" },
        { word: "her", video: "/asl/words/her.mp4" },
        { word: "2", video: "/asl/numbers/2.mp4" },
        { word: "more", video: "/asl/words/more.mp4" },
        { word: "How many", video: "/asl/words/how-many.mp4" },
        { word: "stickers", video: "/asl/words/stickers.mp4" },
        { word: "does", video: "/asl/words/does.mp4" },
        { word: "Mary", video: "/asl/words/mary.mp4" },
        { word: "have", video: "/asl/words/have.mp4" },
        { word: "now", video: "/asl/words/now.mp4" }
      ]
    };
    
    console.log('Adding ASL for Question', QUESTION_ID);
    console.log('Sentence:', ASL_TRANSLATION.sentence);
    console.log('Words:', ASL_TRANSLATION.words.length);
    
    await connection.query(
      'UPDATE Question SET asl_signs = ?, asl_type = ? WHERE question_id = ?',
      [JSON.stringify(ASL_TRANSLATION), 'sentence', QUESTION_ID]
    );
    
    console.log('✅ ASL mapping added successfully!');
    console.log('\nWord sequence:');
    ASL_TRANSLATION.words.forEach((w, i) => {
      console.log(`  ${i + 1}. ${w.word} → ${w.video}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addASLForMaryQuestion().catch(console.error);
