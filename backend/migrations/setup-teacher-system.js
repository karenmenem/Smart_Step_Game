const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupTeacherSystem() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smart_step',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('Connected to database');

        // Read and execute the schema file
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, '../database/teacher-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon and execute each statement
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            console.log('Executing:', statement.substring(0, 50) + '...');
            await connection.query(statement);
        }

        console.log('✅ Teacher system schema created successfully!');
        console.log('Tables created:');
        console.log('  - teachers');
        console.log('  - teacher_content');
        console.log('  - messages');
        console.log('  - notifications');
        console.log('Columns added to question and reading_passage:');
        console.log('  - created_by_type');
        console.log('  - created_by_id');
        console.log('  - has_required_asl');

    } catch (error) {
        console.error('Error setting up teacher system:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run if called directly
if (require.main === module) {
    setupTeacherSystem()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = setupTeacherSystem;
