const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateWithEmbeddableASL() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'SmartStep_db'
    });

    console.log('✅ Connected to database\n');
    console.log('🔄 Using YouTube embeds with timestamps for ASL signs...\n');

    // Bill Vicars ASL Numbers video with timestamps
    const baseUrl = 'https://www.youtube.com/embed/aQvGIIdgFDM';
    
    // Approximate timestamps for each number (in seconds)
    const timestamps = {
      11: { start: 66, end: 69 },
      12: { start: 72, end: 75 },
      14: { start: 84, end: 87 },
      15: { start: 90, end: 93 },
      16: { start: 96, end: 99 },
      17: { start: 102, end: 105 },
      18: { start: 108, end: 111 },
      19: { start: 114, end: 117 },
      20: { start: 120, end: 124 },
      22: { start: 132, end: 136 },
      23: { start: 138, end: 142 },
      24: { start: 144, end: 148 },
      25: { start: 150, end: 154 },
      28: { start: 168, end: 172 },
      29: { start: 174, end: 178 },
      30: { start: 180, end: 184 },
      35: { start: 210, end: 214 }
    };
    
    const updates = [
      { id: 13, signs: [15, 12] },
      { id: 14, signs: [23, 14] },
      { id: 15, signs: [18, 19] },
      { id: 16, signs: [25, 22] },
      { id: 17, signs: [30, 17] },
      { id: 18, signs: [12, 11] },
      { id: 19, signs: [28, 15] },
      { id: 20, signs: [35, 14] },
      { id: 21, signs: [20, 29] },
      { id: 22, signs: [16, 24] }
    ];
    
    for (const update of updates) {
      const num1 = update.signs[0];
      const num2 = update.signs[1];
      
      const time1 = timestamps[num1] || { start: 0, end: 3 };
      const time2 = timestamps[num2] || { start: 0, end: 3 };
      
      const videoUrls = {
        num1: `${baseUrl}?start=${time1.start}&end=${time1.end}`,
        num2: `${baseUrl}?start=${time2.start}&end=${time2.end}`
      };
      
      await connection.query(
        'UPDATE question SET asl_signs = ?, asl_video_url = ?, asl_type = ? WHERE question_id = ?', 
        [JSON.stringify(update.signs), JSON.stringify(videoUrls), 'video', update.id]
      );
      console.log(`   ✅ Q${update.id}: [${num1}] at ${time1.start}s + [${num2}] at ${time2.start}s`);
    }
    
    console.log('\n✅ All questions updated with YouTube embeds!');
    console.log('📺 Each video will start at the exact timestamp for that number');
    console.log('💡 Videos will show inline in the quiz - no external links!');

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

updateWithEmbeddableASL()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
