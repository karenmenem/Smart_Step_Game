const mysql = require('mysql2/promise');

async function checkColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Smart Step Learning1'
  });
  
  try {
    const [columns] = await connection.query('DESCRIBE Question');
    console.log('\nQuestion table columns:');
    columns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkColumns().catch(console.error);
