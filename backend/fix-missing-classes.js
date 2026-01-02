const { query } = require('./config/database');

function generateClassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function fixMissingClasses() {
  try {
    console.log('🔍 Looking for approved teachers without classes...');

    // Find all approved teachers
    const teachers = await query(
      "SELECT id, name FROM teachers WHERE status = 'approved'"
    );

    console.log(`Found ${teachers.length} approved teacher(s)`);

    for (const teacher of teachers) {
      // Check if teacher already has a class
      const existingClasses = await query(
        'SELECT id FROM teacher_classes WHERE teacher_id = ?',
        [teacher.id]
      );

      if (existingClasses.length === 0) {
        console.log(`\n📚 Creating default class for teacher: ${teacher.name} (ID: ${teacher.id})`);

        // Generate unique class code
        let classCode = generateClassCode();
        let exists = await query('SELECT id FROM teacher_classes WHERE class_code = ?', [classCode]);

        while (exists && exists.length > 0) {
          classCode = generateClassCode();
          exists = await query('SELECT id FROM teacher_classes WHERE class_code = ?', [classCode]);
        }

        // Create the class
        const result = await query(
          `INSERT INTO teacher_classes (teacher_id, class_name, class_code, description, is_active)
           VALUES (?, ?, ?, ?, TRUE)`,
          [teacher.id, `${teacher.name}'s Class`, classCode, 'My main class']
        );

        console.log(`✅ Created class with code: ${classCode} (Class ID: ${result.insertId})`);
      } else {
        console.log(`✓ Teacher ${teacher.name} already has ${existingClasses.length} class(es)`);
      }
    }

    console.log('\n✅ Done! All approved teachers now have classes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing missing classes:', error);
    process.exit(1);
  }
}

fixMissingClasses();
