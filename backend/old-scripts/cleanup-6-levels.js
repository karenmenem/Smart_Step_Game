const mysql = require('mysql2/promise');

async function cleanupAndFix6Levels() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    console.log('\n=== Cleaning up to 6-Level Structure ===\n');
    
    // Delete all Level 3 activities that we don't need
    const level3Ids = [12, 15, 21, 24, 30, 33, 39, 42]; // All the Level 3s for math operations
    
    console.log('Deleting Level 3 activities:');
    for (const id of level3Ids) {
      const [activity] = await connection.query('SELECT name FROM activity WHERE activity_id = ?', [id]);
      if (activity && activity.length > 0) {
        console.log(`  Deleting Activity ${id}: ${activity[0].name}`);
        await connection.query('DELETE FROM activity WHERE activity_id = ?', [id]);
      }
    }
    
    console.log('\n✅ All Level 3 activities deleted!');
    console.log('\nFinal Structure (2 sublevels per difficulty):');
    
    const [remaining] = await connection.query(`
      SELECT activity_id, name 
      FROM activity 
      WHERE activity_id BETWEEN 7 AND 42 
        AND name LIKE '%Addition%' 
        OR name LIKE '%Subtraction%' 
        OR name LIKE '%Multiplication%' 
        OR name LIKE '%Division%'
      ORDER BY activity_id
    `);
    
    remaining.forEach(a => console.log(`  ${a.activity_id}: ${a.name}`));
    
    console.log('\n📋 Summary:');
    console.log('✓ Addition: Beginner (7, 8), Intermediate (10, 11), Advanced (13, 14)');
    console.log('✓ Subtraction: Beginner (16, 17), Intermediate (19, 20), Advanced (22, 23)');
    console.log('✓ Multiplication: Beginner (25, 26), Intermediate (28, 29), Advanced (31, 32)');
    console.log('✓ Division: Beginner (34, 35), Intermediate (37, 38), Advanced (40, 41)');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

cleanupAndFix6Levels().catch(console.error);
