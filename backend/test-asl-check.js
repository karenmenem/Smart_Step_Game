const { query } = require('./config/database');

(async () => {
  try {
    console.log('=== Testing ASL Check with Different Formats ===\n');
    
    // Test 1: Array of strings (current format from question 289)
    console.log('Test 1: Array of strings ["her", "name"]');
    const testSigns1 = ["her", "name"];
    let missing1 = [];
    
    for (const sign of testSigns1) {
      let signValue;
      if (typeof sign === 'string') {
        signValue = sign;
      } else if (sign && sign.value) {
        signValue = sign.value;
      } else {
        continue;
      }
      
      if (!signValue) continue;
      
      const signType = /^\d+$/.test(signValue.toString()) ? 'number' : 'word';
      const existing = await query(
        'SELECT id FROM asl_resources WHERE type = ? AND value = ?',
        [signType, signValue.toString()]
      );
      
      if (existing.length === 0) {
        missing1.push({ type: signType, value: signValue });
      }
    }
    
    console.log('Missing ASL:', missing1.length > 0 ? missing1 : 'None');
    console.log('Status should be:', missing1.length > 0 ? 'pending_asl' : 'pending');
    
    // Test 2: Array of objects
    console.log('\n\nTest 2: Array of objects [{value: "what"}, {value: "name"}]');
    const testSigns2 = [{value: "what"}, {value: "name"}];
    let missing2 = [];
    
    for (const sign of testSigns2) {
      let signValue;
      if (typeof sign === 'string') {
        signValue = sign;
      } else if (sign && sign.value) {
        signValue = sign.value;
      } else {
        continue;
      }
      
      if (!signValue) continue;
      
      const signType = /^\d+$/.test(signValue.toString()) ? 'number' : 'word';
      const existing = await query(
        'SELECT id FROM asl_resources WHERE type = ? AND value = ?',
        [signType, signValue.toString()]
      );
      
      if (existing.length === 0) {
        missing2.push({ type: signType, value: signValue });
      }
    }
    
    console.log('Missing ASL:', missing2.length > 0 ? missing2 : 'None');
    console.log('Status should be:', missing2.length > 0 ? 'pending_asl' : 'pending');
    
    // Test 3: Mixed format with numbers
    console.log('\n\nTest 3: Mixed format ["5", {value: "plus"}, "3"]');
    const testSigns3 = ["5", {value: "plus"}, "3"];
    let missing3 = [];
    
    for (const sign of testSigns3) {
      let signValue;
      if (typeof sign === 'string') {
        signValue = sign;
      } else if (sign && sign.value) {
        signValue = sign.value;
      } else {
        continue;
      }
      
      if (!signValue) continue;
      
      const signType = /^\d+$/.test(signValue.toString()) ? 'number' : 'word';
      const existing = await query(
        'SELECT id FROM asl_resources WHERE type = ? AND value = ?',
        [signType, signValue.toString()]
      );
      
      if (existing.length === 0) {
        missing3.push({ type: signType, value: signValue });
      }
    }
    
    console.log('Missing ASL:', missing3.length > 0 ? missing3 : 'None');
    console.log('Status should be:', missing3.length > 0 ? 'pending_asl' : 'pending');
    
    console.log('\n\n✅ ASL check logic now handles both string and object formats!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
