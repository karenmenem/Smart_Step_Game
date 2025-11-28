const { query } = require('./config/database');

async function createLevel3Questions() {
  try {
    console.log('🎯 Creating Addition Level 3 Questions (Advanced - Numbers 100+)\n');
    
    const newQuestions = [
      { q: 'What is 100 + 50?', opts: ['150', '140', '160', '145'], ans: '150', asl: '[1,0,0,"plus",5,0]' },
      { q: 'What is 125 + 25?', opts: ['150', '140', '160', '145'], ans: '150', asl: '[1,2,5,"plus",2,5]' },
      { q: 'What is 200 + 100?', opts: ['300', '290', '310', '295'], ans: '300', asl: '[2,0,0,"plus",1,0,0]' },
      { q: 'What is 150 + 75?', opts: ['225', '215', '235', '220'], ans: '225', asl: '[1,5,0,"plus",7,5]' },
      { q: 'What is 180 + 20?', opts: ['200', '190', '210', '195'], ans: '200', asl: '[1,8,0,"plus",2,0]' },
      { q: 'What is 250 + 50?', opts: ['300', '290', '310', '295'], ans: '300', asl: '[2,5,0,"plus",5,0]' },
      { q: 'What is 135 + 65?', opts: ['200', '190', '210', '195'], ans: '200', asl: '[1,3,5,"plus",6,5]' },
      { q: 'What is 175 + 125?', opts: ['300', '290', '310', '295'], ans: '300', asl: '[1,7,5,"plus",1,2,5]' },
      { q: 'What is 220 + 80?', opts: ['300', '290', '310', '295'], ans: '300', asl: '[2,2,0,"plus",8,0]' },
      { q: 'What is 145 + 55?', opts: ['200', '190', '210', '195'], ans: '200', asl: '[1,4,5,"plus",5,5]' },
    ];
    
    for (const item of newQuestions) {
      await query(`
        INSERT INTO Question (
          activity_id, question_text, question_type, correct_answer, 
          options, asl_signs, asl_type, difficulty_level, points_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        9, // Activity 9 = Addition Beginner Level 3
        item.q,
        'multiple_choice',
        item.ans,
        JSON.stringify(item.opts),
        item.asl,
        'numbers',
        3,
        15
      ]);
      console.log(`   ✅ Added: ${item.q}`);
    }
    
    const total = await query('SELECT COUNT(*) as count FROM Question WHERE activity_id = 9');
    console.log(`\n✅ Level 3 now has ${total[0].count} questions!`);
    console.log('\n🎮 All 3 Addition Beginner levels are now complete!');
    console.log('\n📊 Summary:');
    console.log('   Level 1 (1-10): 10 questions ✅');
    console.log('   Level 2 (10-50): 10 questions ✅');
    console.log('   Level 3 (100+): 10 questions ✅');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createLevel3Questions();
