const mysql = require('mysql2/promise');

async function reduceTo2Levels() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Reducing Math Activities to 2 Levels Only ===\n');
    
    // First, check what sections and activities we have
    const [sections] = await connection.query(`
      SELECT section_id, name, subject_id, difficulty_level, operation_type
      FROM section
      WHERE subject_id = 1
      ORDER BY operation_type, difficulty_level
    `);
    
    console.log('Current Math Sections:');
    sections.forEach(s => {
      console.log(`  Section ID ${s.section_id}: ${s.name} (${s.operation_type} - Level ${s.difficulty_level})`);
    });
    
    // Delete all Level 3 sections for Math
    const [deleteResult] = await connection.query(`
      DELETE FROM section
      WHERE subject_id = 1 AND difficulty_level = 3
    `);
    
    console.log(`\n✓ Deleted ${deleteResult.affectedRows} Level 3 sections (and their activities/questions)`);
    
    // Show remaining sections
    const [remaining] = await connection.query(`
      SELECT section_id, name, difficulty_level, operation_type
      FROM section
      WHERE subject_id = 1
      ORDER BY operation_type, difficulty_level
    `);
    
    console.log('\nRemaining Sections (Levels 1 & 2 only):');
    remaining.forEach(s => {
      console.log(`  Section ID ${s.section_id}: ${s.name} (${s.operation_type} - Level ${s.difficulty_level})`);
    });
    
    console.log('\n✅ Successfully reduced to 2 levels per operation!');
    console.log('Structure now: Addition (L1, L2), Subtraction (L1, L2), Multiplication (L1, L2), Division (L1, L2)');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

reduceTo2Levels().catch(console.error);
