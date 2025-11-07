const mysql = require('mysql2/promise');
const dbConfig = require('./config/database');

async function checkLevels() {
  const connection = await mysql.createConnection(dbConfig);
  
  const [activities] = await connection.query(`
    SELECT activity_id, activity_name, difficulty_level, operation_type
    FROM Activity
    WHERE subject_id = 1
    ORDER BY operation_type, difficulty_level
  `);
  
  console.log('\nCurrent Math Activities:');
  activities.forEach(a => {
    console.log(`ID: ${a.activity_id} | ${a.activity_name} | Op: ${a.operation_type} | Level: ${a.difficulty_level}`);
  });
  
  await connection.end();
}

checkLevels().catch(console.error);
