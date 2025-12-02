const { query } = require('./config/database');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

async function testBulkUpdate() {
    try {
        // Generate admin token
        const token = jwt.sign(
            { adminId: 1, username: 'admin' },
            process.env.JWT_SECRET || 'smartstep-secret-key-2024',
            { expiresIn: '24h' }
        );
        
        console.log('Testing bulk update...\n');
        
        // Get current value
        const before = await query('SELECT setting_value FROM homepage_settings WHERE setting_key = ?', ['logo_text']);
        console.log('Before:', before[0].setting_value);
        
        // Update via API
        const response = await fetch('http://localhost:5001/api/admin/homepage-settings/bulk-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                settings: [
                    { id: 3, setting_value: 'UpdatedLogo' }
                ]
            })
        });
        
        const result = await response.json();
        console.log('API Response:', result.success ? 'Success' : 'Failed');
        
        // Check database
        const after = await query('SELECT setting_value FROM homepage_settings WHERE setting_key = ?', ['logo_text']);
        console.log('After:', after[0].setting_value);
        
        // Check public API
        const publicResponse = await fetch('http://localhost:5001/api/homepage');
        const publicData = await publicResponse.json();
        console.log('Public API returns:', publicData.data.logo_text);
        
        // Reset
        await query('UPDATE homepage_settings SET setting_value = ? WHERE setting_key = ?', ['SmartStep', 'logo_text']);
        console.log('\nReset to default');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testBulkUpdate();
