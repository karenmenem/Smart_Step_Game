const { query } = require('./config/database');

async function addReadingPassages() {
  try {
    console.log('🔧 Adding reading passages support...\n');

    // Create reading_passage table
    await query(`
      CREATE TABLE IF NOT EXISTS reading_passage (
        passage_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        level INT DEFAULT 1,
        subject_id INT,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Reading passage table created');

    // Add passage_id column to question table if it doesn't exist
    try {
      await query(`
        ALTER TABLE question 
        ADD COLUMN passage_id INT,
        ADD FOREIGN KEY (passage_id) REFERENCES reading_passage(passage_id) ON DELETE SET NULL
      `);
      console.log('✅ Added passage_id column to question table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  passage_id column already exists');
      } else {
        throw error;
      }
    }

    // Insert sample reading passages
    const englishSubject = await query('SELECT subject_id FROM subject WHERE name = ?', ['English']);
    const englishSubjectId = englishSubject.length > 0 ? englishSubject[0].subject_id : null;

    // Sample passage 1
    await query(`
      INSERT INTO reading_passage (title, content, level, subject_id, difficulty) VALUES
      (?, ?, ?, ?, ?)
    `, [
      'The Little Garden',
      'Emma has a small garden behind her house. She plants tomatoes, carrots, and flowers. Every morning, she waters the plants. Her favorite flower is the sunflower because it is tall and bright yellow. Emma loves spending time in her garden.',
      1,
      englishSubjectId,
      'easy'
    ]);

    const passage1Id = (await query('SELECT LAST_INSERT_ID() as id'))[0].id;
    console.log('✅ Added passage: The Little Garden (ID:', passage1Id, ')');

    // Sample passage 2
    await query(`
      INSERT INTO reading_passage (title, content, level, subject_id, difficulty) VALUES
      (?, ?, ?, ?, ?)
    `, [
      'A Day at the Zoo',
      'Tom and his family went to the zoo on Saturday. They saw many animals including lions, elephants, and monkeys. The monkeys were very funny and made everyone laugh. Tom\'s favorite animal was the giraffe because it had a very long neck. They had ice cream before going home.',
      1,
      englishSubjectId,
      'easy'
    ]);

    const passage2Id = (await query('SELECT LAST_INSERT_ID() as id'))[0].id;
    console.log('✅ Added passage: A Day at the Zoo (ID:', passage2Id, ')');

    // Sample passage 3
    await query(`
      INSERT INTO reading_passage (title, content, level, subject_id, difficulty) VALUES
      (?, ?, ?, ?, ?)
    `, [
      'The School Library',
      'Sarah loves reading books. Every Tuesday, her class visits the school library. The library has hundreds of books on different topics. Sarah enjoys reading adventure stories and fairy tales. The librarian, Mrs. Johnson, helps students find books they might like. Sarah borrowed three books last week and finished reading all of them.',
      2,
      englishSubjectId,
      'medium'
    ]);

    const passage3Id = (await query('SELECT LAST_INSERT_ID() as id'))[0].id;
    console.log('✅ Added passage: The School Library (ID:', passage3Id, ')');

    console.log('\n📚 Reading passages setup completed!');
    console.log('You can now link questions to passages using the passage_id column.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

addReadingPassages();
