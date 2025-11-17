const mysql = require('mysql2/promise');

async function create6LevelStructure() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Creating 6-Level Structure (Beginner, Intermediate, Advanced - 2 sublevels each) ===\n');
    
    // First, let's check what we currently have
    const [currentActivities] = await connection.query(`
      SELECT activity_id, name FROM activity WHERE activity_id BETWEEN 7 AND 50 ORDER BY activity_id
    `);
    
    console.log('Current Activities:');
    currentActivities.forEach(a => console.log(`  ${a.activity_id}: ${a.name}`));
    
    // Get the Math section
    const [mathSection] = await connection.query(`
      SELECT section_id FROM section WHERE subject_id = 1 LIMIT 1
    `);
    
    if (!mathSection || mathSection.length === 0) {
      console.error('No Math section found!');
      return;
    }
    
    const sectionId = mathSection[0].section_id;
    console.log(`\nUsing section_id: ${sectionId}`);
    
    // We already have Addition Beginner L1 (7) and L2 (8)
    // We need to create:
    // - Addition Intermediate L1 (9), L2 (10)
    // - Addition Advanced L1 (11), L2 (12)
    // - Subtraction Beginner L1 (13), L2 (14), Intermediate L1 (15), L2 (16), Advanced L1 (17), L2 (18)
    // - Multiplication Beginner L1 (19), L2 (20), Intermediate L1 (21), L2 (22), Advanced L1 (23), L2 (24)
    // - Division Beginner L1 (25), L2 (26), Intermediate L1 (27), L2 (28), Advanced L1 (29), L2 (30)
    
    const activities = [
      // Addition (7, 8 already exist)
      { id: 9, name: 'Addition Intermediate - Level 1', op: 'addition', difficulty: 'intermediate', sublevel: 1 },
      { id: 10, name: 'Addition Intermediate - Level 2', op: 'addition', difficulty: 'intermediate', sublevel: 2 },
      { id: 11, name: 'Addition Advanced - Level 1', op: 'addition', difficulty: 'advanced', sublevel: 1 },
      { id: 12, name: 'Addition Advanced - Level 2', op: 'addition', difficulty: 'advanced', sublevel: 2 },
      
      // Subtraction
      { id: 13, name: 'Subtraction Beginner - Level 1', op: 'subtraction', difficulty: 'beginner', sublevel: 1 },
      { id: 14, name: 'Subtraction Beginner - Level 2', op: 'subtraction', difficulty: 'beginner', sublevel: 2 },
      { id: 15, name: 'Subtraction Intermediate - Level 1', op: 'subtraction', difficulty: 'intermediate', sublevel: 1 },
      { id: 16, name: 'Subtraction Intermediate - Level 2', op: 'subtraction', difficulty: 'intermediate', sublevel: 2 },
      { id: 17, name: 'Subtraction Advanced - Level 1', op: 'subtraction', difficulty: 'advanced', sublevel: 1 },
      { id: 18, name: 'Subtraction Advanced - Level 2', op: 'subtraction', difficulty: 'advanced', sublevel: 2 },
      
      // Multiplication
      { id: 19, name: 'Multiplication Beginner - Level 1', op: 'multiplication', difficulty: 'beginner', sublevel: 1 },
      { id: 20, name: 'Multiplication Beginner - Level 2', op: 'multiplication', difficulty: 'beginner', sublevel: 2 },
      { id: 21, name: 'Multiplication Intermediate - Level 1', op: 'multiplication', difficulty: 'intermediate', sublevel: 1 },
      { id: 22, name: 'Multiplication Intermediate - Level 2', op: 'multiplication', difficulty: 'intermediate', sublevel: 2 },
      { id: 23, name: 'Multiplication Advanced - Level 1', op: 'multiplication', difficulty: 'advanced', sublevel: 1 },
      { id: 24, name: 'Multiplication Advanced - Level 2', op: 'multiplication', difficulty: 'advanced', sublevel: 2 },
      
      // Division
      { id: 25, name: 'Division Beginner - Level 1', op: 'division', difficulty: 'beginner', sublevel: 1 },
      { id: 26, name: 'Division Beginner - Level 2', op: 'division', difficulty: 'beginner', sublevel: 2 },
      { id: 27, name: 'Division Intermediate - Level 1', op: 'division', difficulty: 'intermediate', sublevel: 1 },
      { id: 28, name: 'Division Intermediate - Level 2', op: 'division', difficulty: 'intermediate', sublevel: 2 },
      { id: 29, name: 'Division Advanced - Level 1', op: 'division', difficulty: 'advanced', sublevel: 1 },
      { id: 30, name: 'Division Advanced - Level 2', op: 'division', difficulty: 'advanced', sublevel: 2 },
    ];
    
    console.log('\n--- Creating/Updating Activities ---\n');
    
    for (const activity of activities) {
      // Check if activity exists
      const [exists] = await connection.query(
        'SELECT activity_id FROM activity WHERE activity_id = ?',
        [activity.id]
      );
      
      if (exists && exists.length > 0) {
        // Update existing
        await connection.query(`
          UPDATE activity 
          SET name = ?, description = ?
          WHERE activity_id = ?
        `, [
          activity.name,
          `${activity.op} ${activity.difficulty} level ${activity.sublevel}`,
          activity.id
        ]);
        console.log(`✓ Updated Activity ${activity.id}: ${activity.name}`);
      } else {
        // Create new
        await connection.query(`
          INSERT INTO activity (activity_id, section_id, name, description, activity_type, points_value, order_index)
          VALUES (?, ?, ?, ?, 'quiz', 10, ?)
        `, [
          activity.id,
          sectionId,
          activity.name,
          `${activity.op} ${activity.difficulty} level ${activity.sublevel}`,
          activity.id
        ]);
        console.log(`✓ Created Activity ${activity.id}: ${activity.name}`);
      }
    }
    
    console.log('\n✅ Structure created successfully!');
    console.log('\nNow you have:');
    console.log('- Addition: Beginner (L1, L2), Intermediate (L1, L2), Advanced (L1, L2)');
    console.log('- Subtraction: Beginner (L1, L2), Intermediate (L1, L2), Advanced (L1, L2)');
    console.log('- Multiplication: Beginner (L1, L2), Intermediate (L1, L2), Advanced (L1, L2)');
    console.log('- Division: Beginner (L1, L2), Intermediate (L1, L2), Advanced (L1, L2)');
    console.log('\nNext: Update frontend MathLevels.js to show all 3 difficulty levels\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

create6LevelStructure().catch(console.error);
