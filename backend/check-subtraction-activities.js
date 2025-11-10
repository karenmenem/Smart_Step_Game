const { query } = require('./config/database');

async function checkActivities() {
  try {
    const activities = await query(
      `SELECT activity_id, name FROM activity 
       WHERE name LIKE '%Subtraction%' 
       ORDER BY activity_id`
    );
    
    console.log('Subtraction Activities:');
    activities.forEach(a => {
      console.log(`  ID ${a.activity_id}: ${a.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkActivities();
