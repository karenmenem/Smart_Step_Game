const mysql = require('mysql2/promise');

async function listDatabases() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('All databases:');
    databases.forEach(db => {
      const dbName = db.Database || db.SCHEMA_NAME;
      if (dbName.toLowerCase().includes('smart')) {
        console.log('  ✓', dbName);
      }
    });
    
    // Now test both databases
    for (const db of databases) {
      const dbName = db.Database || db.SCHEMA_NAME;
      if (dbName.toLowerCase().includes('smart')) {
        try {
          const testConn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: dbName
          });
          const [count] = await testConn.execute('SELECT COUNT(*) as count FROM question');
          console.log(`\n${dbName}: ${count[0].count} questions`);
          await testConn.end();
        } catch (error) {
          console.log(`\n${dbName}: Error - ${error.message}`);
        }
      }
    }
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listDatabases();
