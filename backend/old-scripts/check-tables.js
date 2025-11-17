const { query } = require('./config/database');

async function checkTables() {
  try {
    const result = await query('DESCRIBE question');
    console.log('Question table structure:');
    console.log(result);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTables();
