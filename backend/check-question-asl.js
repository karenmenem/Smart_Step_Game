const { query } = require('./config/database');

(async () => {
  try {
    console.log('=== Checking Question 289 ASL Status ===\n');
    
    const question = await query('SELECT question_id, question_text, asl_signs, asl_type FROM question WHERE question_id = 289');
    if (question.length === 0) {
      console.log('Question 289 not found');
      process.exit(1);
    }
    
    console.log('Question:', question[0].question_text);
    console.log('ASL Signs:', question[0].asl_signs);
    console.log('ASL Type:', question[0].asl_type);
    
    const aslSigns = JSON.parse(question[0].asl_signs || '[]');
    console.log('\nParsed ASL signs:', aslSigns);
    
    console.log('\n=== Checking ASL Resources ===\n');
    let missingCount = 0;
    for (const sign of aslSigns) {
      if (!sign || !sign.value) continue;
      
      const signType = /^\d+$/.test(sign.value.toString()) ? 'number' : 'word';
      const existing = await query(
        'SELECT * FROM asl_resources WHERE type = ? AND value = ?',
        [signType, sign.value.toString()]
      );
      
      const status = existing.length > 0 ? '✓ EXISTS' : '✗ MISSING';
      console.log(`  ${sign.value} (${signType}): ${status}`);
      if (existing.length === 0) missingCount++;
    }
    
    console.log(`\nMissing ASL resources: ${missingCount}`);
    
    console.log('\n=== Checking teacher_content status ===\n');
    const teacherContent = await query('SELECT * FROM teacher_content WHERE content_id = 289 AND content_type = "question"');
    if (teacherContent.length > 0) {
      console.log('Approval Status:', teacherContent[0].approval_status);
      console.log('Teacher ID:', teacherContent[0].teacher_id);
      console.log('Created at:', teacherContent[0].created_at);
      
      if (missingCount > 0 && teacherContent[0].approval_status === 'pending') {
        console.log('\n⚠️  WARNING: Question has missing ASL but status is "pending" instead of "pending_asl"');
      } else if (missingCount > 0 && teacherContent[0].approval_status === 'pending_asl') {
        console.log('\n✓ CORRECT: Question marked as pending_asl because of missing ASL resources');
      } else if (missingCount === 0) {
        console.log('\n✓ All ASL resources exist, question can be approved normally');
      }
    } else {
      console.log('No teacher_content record found for question 289');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
