const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Smart Step Learning1'
};

// Word problem questions for Addition Level 2 (numbers 10-50)
const sentenceQuestions = [
  {
    id: 34,
    text: "Sarah has 10 stickers and her friend gives her 2 more. How many stickers does Sarah have now? 🎨",
    answer: 12,
    asl_type: 'sentence'
  },
  {
    id: 35,
    text: "Tom collected 15 shells at the beach. He found 5 more in the sand. How many shells does he have? 🐚",
    answer: 20,
    asl_type: 'sentence'
  },
  {
    id: 36,
    text: "Emma read 12 books in January and 8 books in February. How many books did she read total? 📚",
    answer: 20,
    asl_type: 'sentence'
  },
  {
    id: 37,
    text: "A baker made 25 cookies in the morning and 5 more in the afternoon. How many cookies total? 🍪",
    answer: 30,
    asl_type: 'sentence'
  },
  {
    id: 38,
    text: "Jake has 18 toy cars. His brother gives him 7 more toy cars. How many does Jake have now? 🚗",
    answer: 25,
    asl_type: 'sentence'
  },
  {
    id: 39,
    text: "A teacher has 30 pencils in one box and 10 pencils in another box. How many pencils total? ✏️",
    answer: 40,
    asl_type: 'sentence'
  },
  {
    id: 40,
    text: "Lucy planted 22 flowers in the garden. She planted 13 more flowers the next day. How many flowers in total? 🌸",
    answer: 35,
    asl_type: 'sentence'
  },
  {
    id: 41,
    text: "A farmer has 16 chickens and 9 ducks. How many birds does the farmer have? 🐔",
    answer: 25,
    asl_type: 'sentence'
  },
  {
    id: 42,
    text: "David collected 27 stamps. His friend gave him 8 more stamps. How many stamps does David have? 📮",
    answer: 35,
    asl_type: 'sentence'
  },
  {
    id: 43,
    text: "A library had 20 new books arrive. They already had 15 books on the shelf. How many books now? 📖",
    answer: 35,
    asl_type: 'sentence'
  }
];

async function updateLevel2Questions() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('\n🔄 Updating Addition Level 2 with Word Problems...\n');
    console.log('='.repeat(60));
    
    for (const q of sentenceQuestions) {
      // Update the question
      await connection.query(`
        UPDATE Question 
        SET question_text = ?,
            correct_answer = ?,
            asl_type = ?
        WHERE question_id = ?
      `, [q.text, q.answer, q.asl_type, q.id]);
      
      console.log(`✅ Updated Question ${q.id}:`);
      console.log(`   "${q.text}"`);
      console.log(`   Answer: ${q.answer}`);
      console.log(`   ASL Type: ${q.asl_type}`);
      console.log('');
    }
    
    console.log('='.repeat(60));
    console.log('\n✅ All Addition Level 2 questions updated successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Total questions updated: ${sentenceQuestions.length}`);
    console.log('   - All questions now have word problems with emojis');
    console.log('   - ASL type set to "sentence" for word-by-word translation');
    console.log('\n🎯 Students will now get story-based math problems!');
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error updating questions:', error);
  } finally {
    await connection.end();
  }
}

updateLevel2Questions();
