const db = require('./config/database');

async function addMultiplicationActivities() {
  try {
    console.log('Creating Multiplication activities...\n');
    
    // First, check if Math subject exists
    const subjectsResult = await db.query('SELECT subject_id FROM subject WHERE name = ?', ['Math']);
    const subjects = subjectsResult[0];
    let mathSubjectId;
    
    // Check if it's an array or single object
    if (Array.isArray(subjects)) {
      if (subjects.length > 0) {
        mathSubjectId = subjects[0].subject_id;
      }
    } else if (subjects && subjects.subject_id) {
      // Single object returned
      mathSubjectId = subjects.subject_id;
    }
    
    if (!mathSubjectId) {
      console.log('Creating Math subject...');
      const insertResult = await db.query(
        'INSERT INTO subject (name, description) VALUES (?, ?)',
        ['Math', 'Mathematical operations and problem solving']
      );
      mathSubjectId = insertResult[0].insertId;
    }
    
    console.log(`Math subject ID: ${mathSubjectId}\n`);
    
    // Create sections for each difficulty level if they don't exist
    const levels = [
      { level: 1, name: 'Beginner Multiplication', description: 'Basic multiplication facts' },
      { level: 2, name: 'Intermediate Multiplication', description: 'Intermediate multiplication problems' },
      { level: 3, name: 'Advanced Multiplication', description: 'Advanced multiplication challenges' }
    ];
    
    const sectionIds = {};
    
    for (const levelData of levels) {
      // Just get existing section for this level
      const sectionsResult = await db.query(
        'SELECT section_id FROM section WHERE subject_id = ? AND level = ?',
        [mathSubjectId, levelData.level]
      );
      const existingSections = sectionsResult[0];
      
      let sectionId;
      if (Array.isArray(existingSections) && existingSections.length > 0) {
        sectionId = existingSections[0].section_id;
      } else if (existingSections && existingSections.section_id) {
        sectionId = existingSections.section_id;
      } else {
        // Create new section with unique name
        const insertResult = await db.query(
          'INSERT INTO section (subject_id, level, name, description, order_index) VALUES (?, ?, ?, ?, ?)',
          [mathSubjectId, levelData.level, levelData.name + ' Section', levelData.description, 3]
        );
        sectionId = insertResult[0].insertId;
        console.log(`✓ Created section: ${levelData.name} Section (ID: ${sectionId})`);
      }
      
      sectionIds[levelData.level] = sectionId;
      console.log(`✓ Using section for level ${levelData.level}: ID ${sectionId}`);
    }
    
    console.log('\n');
    
    // Create activities for each level with specific IDs
    const activities = [
      { activity_id: 70, section_id: sectionIds[1], name: 'Multiplication Beginner L1', description: 'Basic multiplication Level 1', order_index: 1 },
      { activity_id: 71, section_id: sectionIds[1], name: 'Multiplication Beginner L2', description: 'Basic multiplication Level 2', order_index: 2 },
      { activity_id: 73, section_id: sectionIds[2], name: 'Multiplication Intermediate L1', description: 'Intermediate multiplication Level 1', order_index: 1 },
      { activity_id: 74, section_id: sectionIds[2], name: 'Multiplication Intermediate L2', description: 'Intermediate multiplication Level 2', order_index: 2 },
      { activity_id: 76, section_id: sectionIds[3], name: 'Multiplication Advanced L1', description: 'Advanced multiplication Level 1', order_index: 1 },
      { activity_id: 77, section_id: sectionIds[3], name: 'Multiplication Advanced L2', description: 'Advanced multiplication Level 2', order_index: 2 }
    ];
    
    for (const activity of activities) {
      // Check if activity already exists
      const existingResult = await db.query('SELECT activity_id FROM activity WHERE activity_id = ?', [activity.activity_id]);
      const existing = existingResult[0];
      
      let hasActivity = false;
      if (Array.isArray(existing)) {
        hasActivity = existing.length > 0;
      } else if (existing && existing.activity_id) {
        hasActivity = true;
      }
      
      if (!hasActivity) {
        await db.query(
          'INSERT INTO activity (activity_id, section_id, name, description, activity_type, points_value, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [activity.activity_id, activity.section_id, activity.name, activity.description, 'quiz', 100, activity.order_index]
        );
        console.log(`✓ Created activity: ${activity.name} (ID: ${activity.activity_id})`);
      } else {
        console.log(`✓ Activity exists: ${activity.name} (ID: ${activity.activity_id})`);
      }
    }
    
    console.log('\n✅ Successfully set up all multiplication activities!');
    console.log('\nMultiplication activities are now available in the admin panel.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addMultiplicationActivities();
