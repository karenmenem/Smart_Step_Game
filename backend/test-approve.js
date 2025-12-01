const { query } = require('./config/database');

(async () => {
  try {
    console.log('Testing full approve flow for content id=2...\n');
    
    // Step 1: Update teacher_content
    console.log('Step 1: Updating teacher_content...');
    await query(
      'UPDATE teacher_content SET approval_status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      ['approved', 1, 2]
    );
    console.log('✓ Updated teacher_content');
    
    // Step 2: Get content info
    console.log('\nStep 2: Getting content info...');
    const contentRows = await query(
      'SELECT teacher_id, content_type, content_id FROM teacher_content WHERE id = ?',
      [2]
    );
    const content = contentRows[0];
    console.log('Content info:', content);
    
    // Step 3: Check notifications table structure
    console.log('\nStep 3: Checking notifications table...');
    try {
      const notifColumns = await query('DESCRIBE notifications');
      console.log('Notifications columns:', notifColumns.map(c => c.Field).join(', '));
    } catch (e) {
      console.log('Notifications table does not exist:', e.message);
    }
    
    // Step 4: Create notification
    console.log('\nStep 4: Creating notification...');
    await query(
      `INSERT INTO notifications (user_id, user_type, notification_type, title, message, related_id) 
       VALUES (?, 'teacher', 'content_approved', ?, ?, ?)`,
      [
        content.teacher_id,
        'Content Approved',
        `Your ${content.content_type} has been approved and is now live!`,
        content.content_id || 2
      ]
    );
    console.log('✓ Created notification');
    
    console.log('\n✅ Approval completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('SQL:', error.sql);
    console.error('Code:', error.code);
    process.exit(1);
  }
})();
