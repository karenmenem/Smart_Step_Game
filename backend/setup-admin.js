const { query } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupAdmin() {
  try {
    console.log('🔧 Setting up Admin System...\n');

    // Create admin table
    await query(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(200),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `);
    console.log('✅ Admin table created');

    // Insert default admin (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await query(`
      INSERT IGNORE INTO admin (username, email, password, full_name) VALUES
      (?, ?, ?, ?)
    `, ['admin', 'admin@smartstep.com', hashedPassword, 'System Administrator']);
    
    console.log('✅ Default admin created');
    console.log('\n📝 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@smartstep.com\n');
    console.log('⚠️  Please change the default password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAdmin();
