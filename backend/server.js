const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const { testConnection } = require('./config/database');
const arduinoManager = require('./utils/arduino');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug middleware to log all admin requests
app.use('/api/admin', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('\n=== INCOMING ADMIN REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Body keys:', Object.keys(req.body));
    console.log('==============================\n');
  }
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/asl', require('./routes/asl'));
app.use('/api/homepage', require('./routes/homepage'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Get individual child data with updated points
app.get('/api/children/:childId', async (req, res) => {
  try {
    const { query } = require('./config/database');
    const { childId } = req.params;
    
    const children = await query(
      'SELECT child_id as id, name, age, total_points, profile_picture FROM child WHERE child_id = ?',
      [childId]
    );
    
    if (!children || children.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }
    
    res.json({
      success: true,
      data: children[0]
    });
  } catch (error) {
    console.error('Error fetching child:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch child data'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Smart Step API is running!',
    timestamp: new Date().toISOString()
  });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const startServer = async () => {
  try {
    await testConnection();
    
    // Initialize Arduino (optional - won't crash if not available)
    await arduinoManager.initialize();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
    });

    // Graceful shutdown - properly disconnect Arduino
    const shutdown = async (signal) => {
      console.log(`\n⏸️  Received ${signal}, shutting down gracefully...`);
      
      // Close Arduino connection
      await arduinoManager.close();
      
      // Close server
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();