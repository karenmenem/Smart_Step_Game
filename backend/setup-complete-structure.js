const mysql = require('mysql2/promise');

async function setupCompleteStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });

  try {
    console.log('🚀 Starting complete structure setup...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('⚠️  Clearing existing structure...');
    await connection.execute('DELETE FROM Question');
    await connection.execute('DELETE FROM Activity');
    await connection.execute('DELETE FROM Section');
    await connection.execute('DELETE FROM Subject');
    console.log('✅ Cleared existing data\n');

    // ==================== CREATE SUBJECTS ====================
    console.log('📚 Creating subjects...');
    
    const [mathResult] = await connection.execute(
      'INSERT INTO Subject (name, description) VALUES (?, ?)',
      ['Math', 'Mathematics learning activities']
    );
    const mathSubjectId = mathResult.insertId;
    console.log(`  ✅ Math (ID: ${mathSubjectId})`);

    const [englishResult] = await connection.execute(
      'INSERT INTO Subject (name, description) VALUES (?, ?)',
      ['English', 'English language learning activities']
    );
    const englishSubjectId = englishResult.insertId;
    console.log(`  ✅ English (ID: ${englishSubjectId})\n`);

    // ==================== CREATE MATH SECTIONS ====================
    console.log('📖 Creating Math sections...');
    
    const mathOperations = [
      { name: 'Addition', order: 1 },
      { name: 'Subtraction', order: 2 },
      { name: 'Multiplication', order: 3 },
      { name: 'Division', order: 4 }
    ];

    const mathSections = {};
    let mathSectionLevel = 1;
    
    for (const op of mathOperations) {
      const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
      
      for (let i = 0; i < difficulties.length; i++) {
        const difficulty = difficulties[i];
        
        const [result] = await connection.execute(
          'INSERT INTO Section (subject_id, level, name, description, order_index) VALUES (?, ?, ?, ?, ?)',
          [
            mathSubjectId,
            mathSectionLevel,
            `${op.name} - ${difficulty}`,
            `${difficulty} level ${op.name.toLowerCase()} problems`,
            mathSectionLevel
          ]
        );
        
        const sectionId = result.insertId;
        const key = `${op.name}_${difficulty}`;
        mathSections[key] = sectionId;
        
        console.log(`  ✅ ${op.name} - ${difficulty} (Level ${mathSectionLevel}, ID: ${sectionId})`);
        mathSectionLevel++;
      }
    }
    console.log('');

    // ==================== CREATE ENGLISH SECTIONS ====================
    console.log('📖 Creating English sections...');
    
    const englishTopics = [
      { name: 'Comprehension', order: 1 },
      { name: 'Vocabulary', order: 2 },
      { name: 'Grammar', order: 3 },
      { name: 'Picture Match', order: 4 }
    ];

    const englishSections = {};
    let englishSectionLevel = 1;
    
    for (const topic of englishTopics) {
      const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
      
      for (let i = 0; i < difficulties.length; i++) {
        const difficulty = difficulties[i];
        
        const [result] = await connection.execute(
          'INSERT INTO Section (subject_id, level, name, description, order_index) VALUES (?, ?, ?, ?, ?)',
          [
            englishSubjectId,
            englishSectionLevel,
            `${topic.name} - ${difficulty}`,
            `${difficulty} level ${topic.name.toLowerCase()}`,
            englishSectionLevel
          ]
        );
        
        const sectionId = result.insertId;
        const key = `${topic.name}_${difficulty}`;
        englishSections[key] = sectionId;
        
        console.log(`  ✅ ${topic.name} - ${difficulty} (Level ${englishSectionLevel}, ID: ${sectionId})`);
        englishSectionLevel++;
      }
    }
    console.log('');

    // ==================== CREATE MATH ACTIVITIES ====================
    console.log('🎯 Creating Math activities...');
    
    for (const op of mathOperations) {
      const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
      
      for (let diffIdx = 0; diffIdx < difficulties.length; diffIdx++) {
        const difficulty = difficulties[diffIdx];
        const sectionKey = `${op.name}_${difficulty}`;
        const sectionId = mathSections[sectionKey];
        
        // Create 3 sublevels for each difficulty
        for (let sublevel = 1; sublevel <= 3; sublevel++) {
          const [result] = await connection.execute(
            'INSERT INTO Activity (section_id, name, description, activity_type, points_value, order_index) VALUES (?, ?, ?, ?, ?, ?)',
            [
              sectionId,
              `${op.name} ${difficulty} - Level ${sublevel}`,
              `${difficulty} ${op.name.toLowerCase()} exercises - Level ${sublevel}`,
              'quiz',
              100,
              sublevel
            ]
          );
          
          console.log(`  ✅ ${op.name} ${difficulty} - Level ${sublevel} (Activity ID: ${result.insertId})`);
        }
      }
    }
    console.log('');

    // ==================== CREATE ENGLISH ACTIVITIES ====================
    console.log('🎯 Creating English activities...');
    
    for (const topic of englishTopics) {
      const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
      
      for (let diffIdx = 0; diffIdx < difficulties.length; diffIdx++) {
        const difficulty = difficulties[diffIdx];
        const sectionKey = `${topic.name}_${difficulty}`;
        const sectionId = englishSections[sectionKey];
        
        // Create 3 sublevels for each difficulty
        for (let sublevel = 1; sublevel <= 3; sublevel++) {
          const [result] = await connection.execute(
            'INSERT INTO Activity (section_id, name, description, activity_type, points_value, order_index) VALUES (?, ?, ?, ?, ?, ?)',
            [
              sectionId,
              `${topic.name} ${difficulty} - Level ${sublevel}`,
              `${difficulty} ${topic.name.toLowerCase()} exercises - Level ${sublevel}`,
              'quiz',
              100,
              sublevel
            ]
          );
          
          console.log(`  ✅ ${topic.name} ${difficulty} - Level ${sublevel} (Activity ID: ${result.insertId})`);
        }
      }
    }
    console.log('');

    // ==================== SUMMARY ====================
    console.log('📊 Summary:');
    const [subjects] = await connection.execute('SELECT COUNT(*) as count FROM Subject');
    const [sections] = await connection.execute('SELECT COUNT(*) as count FROM Section');
    const [activities] = await connection.execute('SELECT COUNT(*) as count FROM Activity');
    
    console.log(`  📚 Subjects: ${subjects[0].count}`);
    console.log(`  📖 Sections: ${sections[0].count}`);
    console.log(`  🎯 Activities: ${activities[0].count}`);
    console.log('');
    
    console.log('✅ Structure setup complete!');
    console.log('\n📋 Structure:');
    console.log('   Math:');
    console.log('     • Addition (Beginner L1-3, Intermediate L1-3, Advanced L1-3) = 9 activities');
    console.log('     • Subtraction (Beginner L1-3, Intermediate L1-3, Advanced L1-3) = 9 activities');
    console.log('     • Multiplication (Beginner L1-3, Intermediate L1-3, Advanced L1-3) = 9 activities');
    console.log('     • Division (Beginner L1-3, Intermediate L1-3, Advanced L1-3) = 9 activities');
    console.log('   English:');
    console.log('     • Comprehension (Beginner L1-3, Intermediate L1-3, Advanced L1-3) = 9 activities');
    console.log('     • Vocabulary (Beginner L1-3, Intermediate L1-3, Advanced L1-3) = 9 activities');
    console.log('     • Grammar (Beginner L1-3, Intermediate L1-3, Advanced L1-3) = 9 activities');
    console.log('     • Picture Match (Beginner L1-3, Intermediate L1-3, Advanced L1-3) = 9 activities');
    console.log('\n   Total: 72 activities across 24 sections');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupCompleteStructure().catch(console.error);
