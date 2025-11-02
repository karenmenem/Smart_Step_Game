// Quick test to verify registration endpoint
const fetch = require('node-fetch');

async function testRegistration() {
  const formData = new FormData();
  formData.append('email', 'test@example.com');
  formData.append('password', 'password123');
  formData.append('childName', 'Test Child');
  formData.append('childAge', '7');

  try {
    console.log('Testing registration...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Registration response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testRegistration();