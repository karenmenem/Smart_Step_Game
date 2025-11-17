const { query } = require('./config/database');

const samplePassages = [
  {
    subject: 'English',
    topic: 'comprehension',
    level: 'easy',
    sublevel: '1',
    title: 'The Cat and the Dog',
    content: `Once upon a time, there was a friendly cat named Whiskers and a playful dog named Buddy. They lived in the same house with their loving family. Every morning, Whiskers would wake up early and stretch in the warm sunlight coming through the window. Buddy would wag his tail and run to the kitchen, hoping for breakfast.

One day, they decided to explore the garden together. Whiskers climbed the tall tree while Buddy dug holes in the soft dirt. They played all day and became the best of friends.`
  },
  {
    subject: 'English',
    topic: 'comprehension',
    level: 'easy',
    sublevel: '2',
    title: 'The Magic Garden',
    content: `Sarah found a secret garden behind her grandmother's house. The garden was full of colorful flowers and singing birds. In the center stood an old oak tree with golden leaves that sparkled in the sunlight.

When Sarah touched the tree, something magical happened. The flowers began to dance, and the birds started talking to her in sweet voices. "Welcome to our magical world," they said. Sarah spent hours playing with her new friends, learning about the wonders of nature.`
  }
];

async function addSamplePassages() {
  try {
    for (const passage of samplePassages) {
      await query(
        'INSERT INTO reading_passages (subject, topic, level, sublevel, title, content, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [passage.subject, passage.topic, passage.level, passage.sublevel, passage.title, passage.content, 1]
      );
      console.log(`✅ Added: ${passage.title}`);
    }
    console.log('🎉 All sample reading passages added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample passages:', error);
  }
  process.exit();
}

addSamplePassages();