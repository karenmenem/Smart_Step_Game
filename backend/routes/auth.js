const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/profile-pictures/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const { query } = require('../config/database');

router.post('/register', upload.single('profilePicture'), async (req, res) => {
  try {
    const { email, password, childName, childAge } = req.body;
    
    if (!email || !password || !childName || !childAge) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    const existingParent = await query('SELECT * FROM parent WHERE email = ?', [email]);
    if (existingParent.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const parentResult = await query(
      'INSERT INTO parent (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    
    const parentId = parentResult.insertId;
    
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = req.file.path;
    }
    
    const childResult = await query(
      'INSERT INTO child (parent_id, name, age, current_math_level, current_english_level, profile_picture) VALUES (?, ?, ?, 1, 1, ?)',
      [parentId, childName, parseInt(childAge), profilePicturePath]
    );
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        parentId: parentId,
        childId: childResult.insertId,
        profilePicture: profilePicturePath
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const parents = await query('SELECT * FROM parent WHERE email = ?', [email]);
    if (parents.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const parent = parents[0];
    
    const isValidPassword = await bcrypt.compare(password, parent.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const children = await query('SELECT * FROM child WHERE parent_id = ?', [parent.parent_id]);
    
    const token = jwt.sign(
      { 
        parentId: parent.parent_id,
        email: parent.email,
        childId: children[0]?.child_id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        parent: {
          id: parent.parent_id,
          email: parent.email
        },
        child: children[0] ? {
          id: children[0].child_id,
          name: children[0].name,
          age: children[0].age,
          mathLevel: children[0].current_math_level,
          englishLevel: children[0].current_english_level,
          profile_picture: children[0].profile_picture
        } : null
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

module.exports = router;