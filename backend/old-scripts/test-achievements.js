const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Smart Step Learning1'
};

async function testAchievements() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('\n🎯 Testing Achievement System\n');
    console.log('='.repeat(60));
    
    // Check if total_points column exists in child table
    console.log('\n1. Checking child table structure...');
    const [childCols] = await connection.query('DESCRIBE child');
    const hasPoints = childCols.some(col => col.Field === 'total_points');
    
    if (!hasPoints) {
      console.log('⚠️  total_points column missing! Adding it...');
      await connection.query('ALTER TABLE child ADD COLUMN total_points INT DEFAULT 0');
      console.log('✅ Added total_points column');
    } else {
      console.log('✅ total_points column exists');
    }
    
    // Check achievements
    console.log('\n2. Available Achievements:');
    const [achievements] = await connection.query('SELECT * FROM achievement');
    achievements.forEach((ach, idx) => {
      console.log(`   ${idx + 1}. ${ach.name} - ${ach.description}`);
    });
    
    // Check kid2's progress (ID: 38)
    console.log('\n3. Testing with kid2 (ID: 38)...');
    const [kid2Progress] = await connection.query(`
      SELECT cp.*, a.name as activity_name
      FROM child_progress cp
      JOIN Activity a ON cp.activity_id = a.activity_id
      WHERE cp.child_id = 38
      ORDER BY cp.activity_id
    `);
    
    console.log(`   Progress records: ${kid2Progress.length}`);
    kid2Progress.forEach(p => {
      const pct = Math.round((p.score / p.max_score) * 100);
      console.log(`   - ${p.activity_name}: ${pct}% (${p.score}/${p.max_score}), ${p.attempts} attempts`);
    });
    
    // Check earned achievements
    console.log('\n4. Earned Achievements for kid2:');
    const [earnedAch] = await connection.query(`
      SELECT ca.*, a.name, a.description
      FROM child_achievement ca
      JOIN achievement a ON ca.achievement_id = a.achievement_id
      WHERE ca.child_id = 38
    `);
    
    if (earnedAch.length > 0) {
      earnedAch.forEach(ach => {
        console.log(`   🏆 ${ach.name} - earned on ${ach.earned_at}`);
      });
    } else {
      console.log('   No achievements earned yet');
    }
    
    // Check points
    console.log('\n5. Points Status:');
    const [kid2] = await connection.query('SELECT total_points FROM child WHERE child_id = 38');
    console.log(`   kid2 total points: ${kid2[0]?.total_points || 0}`);
    
    // Expected achievements based on progress
    console.log('\n6. Expected Achievements (based on current progress):');
    console.log('   ✓ First Steps - Should be earned (completed 2 activities)');
    console.log('   ✓ Persistent - Should be earned (82 attempts on Level 1, 256 on Level 2)');
    
    const completedCount = kid2Progress.filter(p => p.completed).length;
    if (completedCount >= 4) {
      console.log('   ✓ Math Wizard - Should be earned (completed multiple activities)');
    } else {
      console.log(`   ⏳ Math Wizard - Not yet (need 4 Level 1 math, have ${completedCount})`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Achievement system test complete!\n');
    console.log('Next steps:');
    console.log('1. Start backend server: cd backend && node server.js');
    console.log('2. Complete a quiz to test automatic achievement awarding');
    console.log('3. Check if points and achievements appear on results screen\n');
    
  } catch (error) {
    console.error('❌ Error testing achievements:', error.message);
  } finally {
    await connection.end();
  }
}

testAchievements();
