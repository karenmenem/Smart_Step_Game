const mysql = require('mysql2/promise');
require('dotenv').config();

async function addLevel2Questions() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'SmartStep_db'
    });

    console.log('✅ Connected to database');

    // Level 2 Addition Questions with ASL video URLs
    // Using Bill Vicars' ASL Numbers video as example
    const level2Questions = [
      {
        activity_id: 2,
        question_text: 'What is 15 + 12?',
        correct_answer: '27',
        options: JSON.stringify(['25', '26', '27', '28']),
        asl_signs: JSON.stringify([15, 12]),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM?start=90&end=93',
        asl_type: 'both',
        difficulty_level: 2,
        points_value: 15,
        order_index: 1
      },
      {
        activity_id: 2,
        question_text: 'What is 23 + 14?',
        correct_answer: '37',
        options: JSON.stringify(['35', '36', '37', '38']),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM',
        asl_type: 'video',
        difficulty_level: 2,
        points_value: 15,
        order_index: 2
      },
      {
        activity_id: 2,
        question_text: 'What is 18 + 19?',
        correct_answer: '37',
        options: JSON.stringify(['35', '36', '37', '38']),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM',
        asl_type: 'video',
        difficulty_level: 2,
        points_value: 15,
        order_index: 3
      },
      {
        activity_id: 2,
        question_text: 'What is 25 + 22?',
        correct_answer: '47',
        options: JSON.stringify(['45', '46', '47', '48']),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM',
        asl_type: 'video',
        difficulty_level: 2,
        points_value: 15,
        order_index: 4
      },
      {
        activity_id: 2,
        question_text: 'What is 30 + 17?',
        correct_answer: '47',
        options: JSON.stringify(['45', '46', '47', '48']),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM',
        asl_type: 'video',
        difficulty_level: 2,
        points_value: 15,
        order_index: 5
      },
      {
        activity_id: 2,
        question_text: 'What is 12 + 11?',
        correct_answer: '23',
        options: JSON.stringify(['21', '22', '23', '24']),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM',
        asl_type: 'video',
        difficulty_level: 2,
        points_value: 15,
        order_index: 6
      },
      {
        activity_id: 2,
        question_text: 'What is 28 + 15?',
        correct_answer: '43',
        options: JSON.stringify(['41', '42', '43', '44']),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM',
        asl_type: 'video',
        difficulty_level: 2,
        points_value: 15,
        order_index: 7
      },
      {
        activity_id: 2,
        question_text: 'What is 35 + 14?',
        correct_answer: '49',
        options: JSON.stringify(['47', '48', '49', '50']),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM',
        asl_type: 'video',
        difficulty_level: 2,
        points_value: 15,
        order_index: 8
      },
      {
        activity_id: 2,
        question_text: 'What is 20 + 29?',
        correct_answer: '49',
        options: JSON.stringify(['47', '48', '49', '50']),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM',
        asl_type: 'video',
        difficulty_level: 2,
        points_value: 15,
        order_index: 9
      },
      {
        activity_id: 2,
        question_text: 'What is 16 + 24?',
        correct_answer: '40',
        options: JSON.stringify(['38', '39', '40', '41']),
        asl_video_url: 'https://www.youtube.com/embed/aQvGIIdgFDM',
        asl_type: 'video',
        difficulty_level: 2,
        points_value: 15,
        order_index: 10
      }
    ];

    console.log('\n📝 Adding Level 2 Addition questions with ASL videos...');

    let added = 0;
    let skipped = 0;

    for (const q of level2Questions) {
      try {
        const [result] = await connection.query(
          `INSERT INTO question 
          (activity_id, question_text, question_type, correct_answer, options, asl_video_url, asl_type, difficulty_level, points_value, order_index) 
          VALUES (?, ?, 'multiple_choice', ?, ?, ?, ?, ?, ?, ?)`,
          [
            q.activity_id,
            q.question_text,
            q.correct_answer,
            q.options,
            q.asl_video_url,
            q.asl_type,
            q.difficulty_level,
            q.points_value,
            q.order_index
          ]
        );
        console.log(`   ✅ Added: "${q.question_text}"`);
        added++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`   ⏭️  Skipped (exists): "${q.question_text}"`);
          skipped++;
        } else {
          console.log(`   ❌ Error adding: "${q.question_text}" - ${err.message}`);
        }
      }
    }

    console.log(`\n✅ Added ${added} new questions`);
    console.log(`⏭️  Skipped ${skipped} existing questions`);

    // Verify questions were added
    const [questions] = await connection.query(`
      SELECT 
        q.question_id,
        q.question_text,
        q.asl_type,
        a.name as activity_name,
        s.level
      FROM question q
      JOIN activity a ON q.activity_id = a.activity_id
      JOIN section s ON a.section_id = s.section_id
      WHERE a.activity_id = 2
      ORDER BY q.order_index
    `);

    console.log('\n📊 Level 2 Addition Questions:');
    questions.forEach((q, index) => {
      console.log(`   ${index + 1}. ${q.question_text} (Type: ${q.asl_type})`);
    });

    console.log('\n🎬 ASL Video URL Used:');
    console.log('   https://www.youtube.com/embed/aQvGIIdgFDM');
    console.log('   (Bill Vicars - ASL Numbers 1-100)');
    console.log('\n💡 You can replace this with specific ASL videos for each question later!');

    console.log('\n🎯 Next Steps:');
    console.log('   1. Start your backend server: cd backend && npm start');
    console.log('   2. Start your frontend: cd frontend && npm start');
    console.log('   3. Login and navigate to Math → Addition → Level 2');
    console.log('   4. You should see ASL videos in the quiz!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed');
    }
  }
}

// Run the script
addLevel2Questions()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
