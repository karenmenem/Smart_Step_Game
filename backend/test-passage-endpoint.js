const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/quiz/reading-passage/English/comprehension/1/1',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
    try {
      const json = JSON.parse(data);
      console.log('\nParsed:', JSON.stringify(json, null, 2));
      if (json.success && json.data) {
        console.log('\n✅ Passage found!');
        console.log('Title:', json.data.title);
        console.log('Content preview:', json.data.content.substring(0, 100) + '...');
      }
    } catch (e) {
      console.error('Parse error:', e.message);
    }
    process.exit();
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  process.exit(1);
});

req.end();
