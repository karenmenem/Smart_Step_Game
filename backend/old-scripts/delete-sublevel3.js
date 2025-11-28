const mysql = require('mysql2/promise');

async function deleteSublevel3() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Deleting Sublevel 3 from All Operations ===\n');
    
    // Activity IDs for sublevel 3 (based on the 72 activities setup):
    // Addition Level 3: activity_id 9
    // Subtraction Level 3: activity_id 18
    // Multiplication Level 3: activity_id 27
    // Division Level 3: activity_id 36
    
    const sublevel3Ids = [9, 18, 27, 36];
    
    // Check what we're about to delete
    const [activities] = await connection.query(`
      SELECT activity_id, name FROM activity WHERE activity_id IN (?, ?, ?, ?)
    `, sublevel3Ids);
    
    console.log('Activities to delete (Sublevel 3):');
    activities.forEach(a => {
      console.log(`  Activity ${a.activity_id}: ${a.name}`);
    });
    
    // Count questions in these activities
    const [questionCount] = await connection.query(`
      SELECT COUNT(*) as total FROM question WHERE activity_id IN (?, ?, ?, ?)
    `, sublevel3Ids);
    
    console.log(`\nThis will also delete ${questionCount[0].total} questions from these activities.\n`);
    
    // Delete them
    const [result] = await connection.query(`
      DELETE FROM activity WHERE activity_id IN (?, ?, ?, ?)
    `, sublevel3Ids);
    
    console.log(`✓ Deleted ${result.affectedRows} sublevel 3 activities`);
    console.log('\n✅ Done! Now each operation has only 2 sublevels:');
    console.log('   - Sublevel 1: Simple (Beginner)');
    console.log('   - Sublevel 2: Intermediate (Beginner)');
    console.log('\nNext step: Update frontend to remove sublevel 3 buttons\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

deleteSublevel3().catch(console.error);
