const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupHomepageSettings() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_step_learning'
    });

    console.log('✅ Connected to database');

    // Read and execute the SQL file
    const sqlFile = path.join(__dirname, 'database', 'homepage-settings-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('✅ Homepage settings table created and initialized');
    console.log('✅ Default settings inserted');

    // Verify the setup
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM homepage_settings');
    console.log(`✅ Total settings: ${rows[0].count}`);

  } catch (error) {
    console.error('❌ Error setting up homepage settings:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the setup
setupHomepageSettings()
  .then(() => {
    console.log('\n🎉 Homepage settings setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  });
