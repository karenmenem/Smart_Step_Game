const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = 5001; // Different port to avoid conflicts

const { testConnection, query } = require('./config/database');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple test endpoint
app.post('/test-register', async (req, res) => {
  try {
    console.log('Test registration body:', req.body);
    
    const { email, password, childName, childAge } = req.body;
    
    if (!email || !password || !childName || !childAge) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Test database connection
    await testConnection();
    console.log('Database connection OK');
    
    // Test parent insert
    const hashedPassword = 'test123';
    const parentResult = await query(
      'INSERT INTO parent (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    console.log('Parent inserted, ID:', parentResult.insertId);
    
    // Test child insert
    const childResult = await query(
      'INSERT INTO child (parent_id, name, age, current_math_level, current_english_level, profile_picture) VALUES (?, ?, ?, 1, 1, ?)',
      [parentResult.insertId, childName, parseInt(childAge), null]
    );
    console.log('Child inserted, ID:', childResult.insertId);
    
    res.status(201).json({
      success: true,
      message: 'Test registration successful!',
      data: {
        parentId: parentResult.insertId,
        childId: childResult.insertId
      }
    });
    
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const startServer = async () => {
  try {
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🧪 Test server running on http://localhost:${PORT}`);
      console.log('Test endpoint: POST /test-register');
    });
  } catch (error) {
    console.error('Failed to start test server:', error);
  }
};

startServer();