const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function migrateDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'SmartStep_db',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Check if asl_video_url column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'SmartStep_db'}' 
      AND TABLE_NAME = 'question' 
      AND COLUMN_NAME IN ('asl_video_url', 'asl_type')
    `);

    console.log('\n📊 Current columns:', columns.map(c => c.COLUMN_NAME));

    // Add columns if they don't exist
    if (!columns.find(c => c.COLUMN_NAME === 'asl_video_url')) {
      console.log('\n➕ Adding asl_video_url column...');
      await connection.query(`
        ALTER TABLE question 
        ADD COLUMN asl_video_url VARCHAR(500) AFTER asl_signs
      `);
      console.log('✅ Added asl_video_url column');
    } else {
      console.log('ℹ️  asl_video_url column already exists');
    }

    if (!columns.find(c => c.COLUMN_NAME === 'asl_type')) {
      console.log('\n➕ Adding asl_type column...');
      await connection.query(`
        ALTER TABLE question 
        ADD COLUMN asl_type ENUM('numbers', 'video', 'both', 'none') DEFAULT 'numbers' AFTER asl_video_url
      `);
      console.log('✅ Added asl_type column');
    } else {
      console.log('ℹ️  asl_type column already exists');
    }

    // Set default asl_type for existing questions
    console.log('\n🔄 Setting default asl_type for existing questions...');
    await connection.query(`
      UPDATE question 
      SET asl_type = 'numbers' 
      WHERE asl_type IS NULL AND asl_signs IS NOT NULL
    `);
    console.log('✅ Updated existing questions');

    // Create admin table if it doesn't exist
    console.log('\n📋 Creating admin table if not exists...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `);
    console.log('✅ Admin table ready');

    // Check if admin user exists
    const [adminUsers] = await connection.query('SELECT * FROM admin WHERE username = ?', ['admin']);
    
    if (adminUsers.length === 0) {
      console.log('\n👤 Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO admin (username, password, email) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin@smartstep.com']
      );
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Insert example questions with ASL video URLs
    console.log('\n📝 Adding example questions with ASL videos...');
    
    const exampleQuestions = [
      {
        activity_id: 3,
        question_text: 'What is 100 + 167?',
        correct_answer: '267',
        options: JSON.stringify(["267", "257", "277", "367"]),
        asl_video_url: 'https://www.youtube.com/embed/example-100-167',
        asl_type: 'video'
      },
      {
        activity_id: 3,
        question_text: 'What is 234 + 456?',
        correct_answer: '690',
        options: JSON.stringify(["690", "680", "700", "790"]),
        asl_video_url: 'https://www.youtube.com/embed/example-234-456',
        asl_type: 'video'
      }
    ];

    for (const q of exampleQuestions) {
      try {
        await connection.query(
          `INSERT IGNORE INTO question 
          (activity_id, question_text, question_type, correct_answer, options, asl_video_url, asl_type, difficulty_level, points_value) 
          VALUES (?, ?, 'multiple_choice', ?, ?, ?, ?, 3, 20)`,
          [q.activity_id, q.question_text, q.correct_answer, q.options, q.asl_video_url, q.asl_type]
        );
      } catch (err) {
        // Ignore duplicate errors
        if (!err.message.includes('Duplicate')) {
          console.log(`⚠️  Could not insert question: ${q.question_text}`);
        }
      }
    }
    console.log('✅ Example questions added');

    // Verify the changes
    console.log('\n🔍 Verifying changes...');
    const [updatedColumns] = await connection.query(`
      SHOW COLUMNS FROM question LIKE 'asl%'
    `);
    console.log('\n📋 ASL-related columns:');
    updatedColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });

    const [questionCount] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN asl_type = 'numbers' THEN 1 ELSE 0 END) as numbers_type,
        SUM(CASE WHEN asl_type = 'video' THEN 1 ELSE 0 END) as video_type,
        SUM(CASE WHEN asl_type = 'both' THEN 1 ELSE 0 END) as both_type
      FROM question
    `);
    console.log('\n📊 Question statistics:');
    console.log(`   Total questions: ${questionCount[0].total}`);
    console.log(`   Numbers type: ${questionCount[0].numbers_type}`);
    console.log(`   Video type: ${questionCount[0].video_type}`);
    console.log(`   Both type: ${questionCount[0].both_type}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📚 ASL Video URL Resources:');
    console.log('   1. Sign ASL: https://www.signasl.org/');
    console.log('   2. Lifeprint ASL University: https://www.lifeprint.com/');
    console.log('   3. ASL Signing Savvy: https://www.signingsavvy.com/');
    console.log('   4. Bill Vicars (YouTube): https://www.youtube.com/@billvicars');
    console.log('   5. ASL That: https://www.aslthat.com/');
    console.log('\n💡 Usage: Copy embed URLs from YouTube videos or use direct video links');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed');
    }
  }
}

// Run migration
migrateDatabase()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
