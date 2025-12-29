const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profile-pictures/');
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// registration route
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  console.log('Registration attempt:', {
    body: req.body,
    file: req.file ? 'File uploaded' : 'No file'
  });

  try {
    const { email, password, childName, childAge } = req.body;
    
    // validate email/pass/name...
    if (!email || !password || !childName || !childAge) {
      console.log('Missing required fields:', { email: !!email, password: !!password, childName: !!childName, childAge: !!childAge });
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required (email, password, childName, childAge)' 
      });
    }

    // validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // pass length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // age lal child
    const age = parseInt(childAge);
    if (isNaN(age) || age < 3 || age > 18) {
      return res.status(400).json({ 
        success: false, 
        message: 'Child age must be between 3 and 18' 
      });
    }
    
    // check eza parents email exists
    const existingParent = await query('SELECT * FROM parent WHERE email = ?', [email]);
    if (existingParent.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered. Please use a different email or try logging in.' 
      });
    }
    
    // hash pass
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');
    
    // insert parent recrd
    const parentResult = await query(
      'INSERT INTO parent (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    
    const parentId = parentResult.insertId;
    console.log('Parent created with ID:', parentId);
    
    // pp
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = req.file.path.replace(/\\/g, '/'); // Normalize path separators
      console.log('Profile picture uploaded:', profilePicturePath);
    }
    
    // insert child record
    const childResult = await query(
      'INSERT INTO child (parent_id, name, age, current_math_level, current_english_level, profile_picture) VALUES (?, ?, ?, 1, 1, ?)',
      [parentId, childName, age, profilePicturePath]
    );
    
    const childId = childResult.insertId;
    console.log('Child created with ID:', childId);

    // Generate JWT token
    const token = jwt.sign(
      { 
        parentId: parentId,
        email: email,
        childId: childId
      },
      process.env.JWT_SECRET || 'smartstep-secret-key-2024',
      { expiresIn: '7d' }
    );
    
    // prepare child data
    const childData = {
      id: childId,
      name: childName,
      age: age,
      mathLevel: 1,
      englishLevel: 1,
      profile_picture: profilePicturePath,
      totalPoints: 0
    };
    
    // Return success response with child in both formats for compatibility
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to SmartStep!',
      data: {
        token: token,
        parent: {
          id: parentId,
          email: email
        },
        child: childData,
        children: [childData]
      }
    });
    
    console.log('Registration successful for:', email);
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed due to server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// login - multople children
router.post('/login', async (req, res) => {
  console.log('Login attempt for:', req.body.email); 
  
  try {
    const { email, password } = req.body; // email + pass from react
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // find parents email
    const parents = await query('SELECT * FROM parent WHERE email = ?', [email]);
    if (parents.length === 0) {
      console.log('Parent not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const parent = parents[0];
    
    // to verify pass
    const isValidPassword = await bcrypt.compare(password, parent.password);
    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // get all children from db
    const children = await query('SELECT * FROM child WHERE parent_id = ? ORDER BY created_at ASC', [parent.parent_id]);
    console.log(`Found ${children.length} children for parent:`, email);
    
    // Generate token with parent info and first child (if exists)
    const token = jwt.sign(
      { 
        parentId: parent.parent_id,
        email: parent.email,
        childId: children[0]?.child_id || null
      },
      process.env.JWT_SECRET || 'smartstep-secret-key-2024',
      { expiresIn: '7d' }
    );
    
    // prepare child data
    const childrenData = children.map(child => ({
      id: child.child_id,
      name: child.name,
      age: child.age,
      mathLevel: child.current_math_level,
      englishLevel: child.current_english_level,
      profile_picture: child.profile_picture,
      totalPoints: child.total_points
    }));
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        parent: {
          id: parent.parent_id,
          email: parent.email
        },
        children: childrenData,
        // Keep backwards compatibility
        child: childrenData[0] || null
      }
    });
    
    console.log('Login successful for:', email);
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ADD CHILD ROUTE - New route for adding additional children
router.post('/add-child', upload.single('profilePicture'), async (req, res) => {
  console.log('Add child attempt:', req.body);
  
  try {
    const { parentId, childName, childAge } = req.body;
    
    if (!parentId || !childName || !childAge) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parent ID, child name, and child age are required' 
      });
    }

    // Validate child age
    const age = parseInt(childAge);
    if (isNaN(age) || age < 3 || age > 18) {
      return res.status(400).json({ 
        success: false, 
        message: 'Child age must be between 3 and 18' 
      });
    }

    // Verify parent exists
    const parent = await query('SELECT * FROM parent WHERE parent_id = ?', [parentId]);
    if (parent.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parent not found' 
      });
    }

    // Check if child name already exists for this parent
    const existingChild = await query('SELECT * FROM child WHERE parent_id = ? AND name = ?', [parentId, childName]);
    if (existingChild.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A child with this name already exists' 
      });
    }
    
    // Handle profile picture
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = req.file.path.replace(/\\/g, '/');
    }
    
    // Insert new child
    const childResult = await query(
      'INSERT INTO child (parent_id, name, age, current_math_level, current_english_level, profile_picture) VALUES (?, ?, ?, 1, 1, ?)',
      [parentId, childName, age, profilePicturePath]
    );
    
    const childId = childResult.insertId;
    console.log('New child added with ID:', childId);
    
    res.status(201).json({
      success: true,
      message: 'Child added successfully!',
      data: {
        id: childId,
        name: childName,
        age: age,
        mathLevel: 1,
        englishLevel: 1,
        profile_picture: profilePicturePath,
        totalPoints: 0
      }
    });
    
  } catch (error) {
    console.error('Add child error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add child due to server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET CHILDREN ROUTE - Get all children for a parent
router.get('/children/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    
    const children = await query('SELECT * FROM child WHERE parent_id = ? ORDER BY created_at ASC', [parentId]);
    
    const childrenData = children.map(child => ({
      id: child.child_id,
      name: child.name,
      age: child.age,
      mathLevel: child.current_math_level,
      englishLevel: child.current_english_level,
      profile_picture: child.profile_picture,
      totalPoints: child.total_points,
      createdAt: child.created_at
    }));
    
    res.json({
      success: true,
      data: childrenData
    });
    
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get children. Please try again.'
    });
  }
});

module.exports = router;