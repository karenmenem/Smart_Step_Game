const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

async function setupTeacherStudentTracking() {
  console.log('🚀 Setting up Teacher-Student Tracking System...\n');

  try {
    // Read and execute the schema file
    const schemaPath = path.join(__dirname, '../database/teacher-student-tracking-schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
      }
    }
    
    console.log('✅ Database tables created successfully');
    
    // Generate a default class code function
    function generateClassCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }
    
    // Create a default class for existing approved teachers
    const teachers = await db.query(
      "SELECT id, name FROM teachers WHERE status = 'approved'"
    );
    
    if (teachers && teachers.length > 0) {
      console.log(`\n📚 Creating default classes for ${teachers.length} approved teacher(s)...`);
      
      for (const teacher of teachers) {
        let classCode = generateClassCode();
        
        // Ensure unique code
        let exists = await db.query(
          'SELECT id FROM teacher_classes WHERE class_code = ?',
          [classCode]
        );
        
        while (exists && exists.length > 0) {
          classCode = generateClassCode();
          exists = await db.query(
            'SELECT id FROM teacher_classes WHERE class_code = ?',
            [classCode]
          );
        }
        
        await db.query(
          `INSERT INTO teacher_classes (teacher_id, class_name, class_code, description, is_active)
           VALUES (?, ?, ?, ?, ?)`,
          [
            teacher.id,
            `${teacher.name}'s Class`,
            classCode,
            'Default class for student tracking',
            true
          ]
        );
        
        console.log(`   ✓ Created class for ${teacher.name} - Code: ${classCode}`);
      }
    }
    
    console.log('\n✅ Teacher-Student Tracking System setup complete!');
    console.log('\n📋 New Features Available:');
    console.log('   • Teachers can generate class codes');
    console.log('   • Parents can link children to teachers');
    console.log('   • Parents control what data is shared');
    console.log('   • Teachers can view student progress');
    console.log('   • Teachers can add notes and assignments');
    console.log('   • Detailed progress history tracking\n');
    
  } catch (error) {
    console.error('❌ Error setting up tracking system:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

setupTeacherStudentTracking();
