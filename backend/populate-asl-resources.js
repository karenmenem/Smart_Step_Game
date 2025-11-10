const fs = require('fs');
const path = require('path');
const db = require('./config/database');

const populateASLResources = async () => {
  try {
    console.log('🔄 Scanning ASL video folders...');

    const aslBasePath = path.join(__dirname, '../frontend/public/asl');
    const resources = [];

    // Scan words folder
    const wordsPath = path.join(aslBasePath, 'words');
    if (fs.existsSync(wordsPath)) {
      const wordFiles = fs.readdirSync(wordsPath).filter(f => f.endsWith('.mp4'));
      wordFiles.forEach(file => {
        const value = file.replace('.mp4', '');
        resources.push({
          type: 'word',
          value: value,
          filename: file,
          aliases: null
        });
      });
      console.log(`✅ Found ${wordFiles.length} word videos`);
    }

    // Scan numbers folder
    const numbersPath = path.join(aslBasePath, 'numbers');
    if (fs.existsSync(numbersPath)) {
      const numberFiles = fs.readdirSync(numbersPath).filter(f => f.endsWith('.mp4'));
      numberFiles.forEach(file => {
        const value = file.replace('.mp4', '');
        resources.push({
          type: 'number',
          value: value,
          filename: file,
          aliases: null
        });
      });
      console.log(`✅ Found ${numberFiles.length} number videos`);
    }

    // Scan operations folder with aliases
    const operationsPath = path.join(aslBasePath, 'operations');
    if (fs.existsSync(operationsPath)) {
      const operationFiles = fs.readdirSync(operationsPath).filter(f => f.endsWith('.mp4'));
      
      const operationAliases = {
        'plus': ['+', 'add'],
        'minus': ['-', 'subtract'],
        'times': ['×', '*', 'multiply'],
        'divide': ['÷', '/', 'divided by'],
        'equals': ['=']
      };

      operationFiles.forEach(file => {
        const value = file.replace('.mp4', '');
        resources.push({
          type: 'operation',
          value: value,
          filename: file,
          aliases: operationAliases[value] ? JSON.stringify(operationAliases[value]) : null
        });
      });
      console.log(`✅ Found ${operationFiles.length} operation videos`);
    }

    // Insert into database
    console.log(`\n🔄 Inserting ${resources.length} resources into database...`);
    
    let inserted = 0;
    for (const resource of resources) {
      try {
        const result = await db.query(
          `INSERT INTO asl_resources (type, value, filename, aliases) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE filename = ?, aliases = ?`,
          [resource.type, resource.value, resource.filename, resource.aliases, resource.filename, resource.aliases]
        );
        inserted++;
        if (inserted % 50 === 0) {
          console.log(`  Inserted ${inserted}/${resources.length}...`);
        }
      } catch (err) {
        console.error(`Failed to insert ${resource.type} "${resource.value}":`, err.message);
      }
    }

    console.log(`✅ Successfully inserted ${inserted} resources!`);
    
    // Verify
    const count = await db.query('SELECT COUNT(*) as total FROM asl_resources');
    console.log(`📊 Database now has ${count[0].total} total resources`);
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Words: ${resources.filter(r => r.type === 'word').length}`);
    console.log(`   - Numbers: ${resources.filter(r => r.type === 'number').length}`);
    console.log(`   - Operations: ${resources.filter(r => r.type === 'operation').length}`);
    console.log(`   - Total: ${resources.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating ASL resources:', error);
    process.exit(1);
  }
};

populateASLResources();
