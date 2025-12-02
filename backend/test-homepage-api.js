const { query } = require('./config/database');
const jwt = require('jsonwebtoken');

async function test() {
    try {
        // Generate admin token
        const token = jwt.sign(
            { adminId: 1, username: 'admin' },
            process.env.JWT_SECRET || 'smartstep-secret-key-2024',
            { expiresIn: '24h' }
        );
        
        console.log('Generated Token:', token);
        
        // Test database query
        const settings = await query('SELECT * FROM homepage_settings ORDER BY category, setting_key LIMIT 5');
        console.log('\nFirst 5 homepage settings:');
        console.log(settings);
        
        // Test if admin exists
        const admin = await query('SELECT * FROM admin WHERE admin_id = 1');
        console.log('\nAdmin found:', admin.length > 0);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
