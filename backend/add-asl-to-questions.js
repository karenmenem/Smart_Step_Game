const mysql = require('mysql2/promise');

/**
 * Example script to add ASL data to existing questions
 * This shows you how to update questions with ASL support
 */

async function addASLToQuestions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });

  try {
    console.log('📝 Adding ASL support to existing questions...\n');

    // Example 1: Add ASL signs array for simple math (auto-detects resources)
    // Question: "What is 2 + 3?"
    await connection.execute(
      `UPDATE Question 
       SET asl_signs = ?, asl_type = 'numbers'
       WHERE question_id = 24`,
      [JSON.stringify([2, 'plus', 3])]
    );
    console.log('✅ Added ASL to Q24: What is 2 + 3?');

    // Example 2: Add ASL for multi-digit number (digit by digit)
    // Question: "What is 23 + 15?" (if it existed)
    // await connection.execute(
    //   `UPDATE Question 
    //    SET asl_signs = ?, asl_type = 'numbers'
    //    WHERE question_text LIKE '%23 + 15%'`,
    //   [JSON.stringify([2, 3, 'plus', 1, 5])]
    // );

    // Example 3: Add custom video URLs
    // await connection.execute(
    //   `UPDATE Question 
    //    SET asl_video_url = ?, asl_type = 'video'
    //    WHERE question_id = 25`,
    //   [JSON.stringify([
    //     'https://your-cdn.com/asl/1.mp4',
    //     'https://your-cdn.com/asl/plus.mp4',
    //     'https://your-cdn.com/asl/1.mp4'
    //   ])]
    // );

    // Example 4: Add image URLs
    // await connection.execute(
    //   `UPDATE Question 
    //    SET asl_image_url = ?, asl_type = 'images'
    //    WHERE question_id = 26`,
    //   [JSON.stringify([
    //     '/asl-images/3.png',
    //     '/asl-images/plus.png',
    //     '/asl-images/2.png'
    //   ])]
    // );

    // Example 5: For English comprehension with sentence
    // await connection.execute(
    //   `UPDATE Question 
    //    SET asl_video_url = ?, asl_type = 'video'
    //    WHERE question_text LIKE '%cat%'`,
    //   [JSON.stringify([
    //     '/asl/words/what.mp4',
    //     '/asl/words/is.mp4',
    //     '/asl/words/the.mp4',
    //     '/asl/words/cat.mp4',
    //     '/asl/words/doing.mp4',
    //     '/asl/special/question.mp4'
    //   ])]
    // );

    // Bulk update: Add ASL to all Level 1 addition questions
    const [questions] = await connection.execute(
      'SELECT question_id, question_text FROM Question WHERE activity_id = 7'
    );

    for (const q of questions) {
      // Extract numbers from question text
      const match = q.question_text.match(/(\d+)\s*\+\s*(\d+)/);
      if (match) {
        const num1 = match[1];
        const num2 = match[2];
        
        // Build ASL signs array (digit by digit)
        const aslSigns = [];
        
        // Add first number digits
        for (const digit of num1) {
          aslSigns.push(parseInt(digit));
        }
        
        // Add operation
        aslSigns.push('plus');
        
        // Add second number digits
        for (const digit of num2) {
          aslSigns.push(parseInt(digit));
        }
        
        await connection.execute(
          `UPDATE Question 
           SET asl_signs = ?, asl_type = 'numbers'
           WHERE question_id = ?`,
          [JSON.stringify(aslSigns), q.question_id]
        );
        
        console.log(`✅ Added ASL to Q${q.question_id}: ${q.question_text} -> ${JSON.stringify(aslSigns)}`);
      }
    }

    console.log('\n✅ ASL data added successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Add ASL video/image files to /frontend/public/asl/ folder');
    console.log('2. Update aslTranslator.js with correct file paths');
    console.log('3. Test in quiz to see ASL Player in action');

  } catch (error) {
    console.error('❌ Error adding ASL:', error);
  } finally {
    await connection.end();
  }
}

addASLToQuestions();
