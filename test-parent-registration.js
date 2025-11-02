// Test registration endpoint directly
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testRegistration() {
  try {
    console.log('Testing parent-only registration...');
    
    const formData = new FormData();
    formData.append('email', 'testparent@example.com');
    formData.append('password', 'password123');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Registration response:', JSON.stringify(data, null, 2));
    console.log('Status:', response.status);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testRegistration();