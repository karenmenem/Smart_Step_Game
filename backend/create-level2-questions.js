const { query } = require('./config/database');

async function createLevel2Questions() {
  try {
    console.log('🎯 Creating Addition Level 2 Questions (Intermediate - Numbers 10-50)\n');
    
    // First, add ASL signs to existing questions
    console.log('1. Updating existing questions with ASL signs...\n');
    
    await query(`
      UPDATE Question 
      SET asl_signs = '[1,0,"plus",2]', asl_type = 'numbers'
      WHERE activity_id = 8 AND question_text LIKE '%10 + 2%'
    `);
    console.log('   ✅ Updated: What is 10 + 2');
    
    await query(`
      UPDATE Question 
      SET asl_signs = '[3,"plus",2]', asl_type = 'numbers'
      WHERE activity_id = 8 AND question_text LIKE '%Tom went to%'
    `);
    console.log('   ✅ Updated: Tom word problem');
    
    // Now add 8 more questions to make 10 total
    console.log('\n2. Adding new Level 2 questions...\n');
    
    const newQuestions = [
      { q: 'What is 15 + 5?', opts: ['20', '19', '21', '18'], ans: '20', asl: '[1,5,"plus",5]' },
      { q: 'What is 12 + 8?', opts: ['20', '19', '21', '18'], ans: '20', asl: '[1,2,"plus",8]' },
      { q: 'What is 25 + 5?', opts: ['30', '29', '31', '28'], ans: '30', asl: '[2,5,"plus",5]' },
      { q: 'What is 18 + 7?', opts: ['25', '24', '26', '23'], ans: '25', asl: '[1,8,"plus",7]' },
      { q: 'What is 30 + 10?', opts: ['40', '39', '41', '38'], ans: '40', asl: '[3,0,"plus",1,0]' },
      { q: 'What is 22 + 13?', opts: ['35', '34', '36', '33'], ans: '35', asl: '[2,2,"plus",1,3]' },
      { q: 'What is 16 + 9?', opts: ['25', '24', '26', '23'], ans: '25', asl: '[1,6,"plus",9]' },
      { q: 'What is 27 + 8?', opts: ['35', '34', '36', '33'], ans: '35', asl: '[2,7,"plus",8]' },
    ];
    
    for (const item of newQuestions) {
      await query(`
        INSERT INTO Question (
          activity_id, question_text, question_type, correct_answer, 
          options, asl_signs, asl_type, difficulty_level, points_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        8, // Activity 8 = Addition Beginner Level 2
        item.q,
        'multiple_choice',
        item.ans,
        JSON.stringify(item.opts),
        item.asl,
        'numbers',
        2,
        10
      ]);
      console.log(`   ✅ Added: ${item.q}`);
    }
    
    // Verify total
    const total = await query('SELECT COUNT(*) as count FROM Question WHERE activity_id = 8');
    console.log(`\n✅ Level 2 now has ${total[0].count} questions!`);
    console.log('\n🎮 Students can now play Level 2 with full ASL support!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createLevel2Questions();
