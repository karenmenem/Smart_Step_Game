const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file upload
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

// REGISTRATION ROUTE - Fixed and improved
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  console.log('Registration attempt:', {
    body: req.body,
    file: req.file ? 'File uploaded' : 'No file',
    email: req.body.email,
    password: req.body.password ? '[PROVIDED]' : '[MISSING]',
    childName: req.body.childName,
    childAge: req.body.childAge
  });

  try {
    const { email, password, childName, childAge } = req.body;
    
    // Validate required fields for parent
    if (!email || !password) {
      console.log('Missing required fields:', { email: !!email, password: !!password });
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if this is parent-only registration (no child data)
    const isParentOnly = !childName || !childAge;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Validate child age if child data is provided
    if (!isParentOnly) {
      const age = parseInt(childAge);
      if (isNaN(age) || age < 3 || age > 18) {
        return res.status(400).json({ 
          success: false, 
          message: 'Child age must be between 3 and 18' 
        });
      }
    }
    
    // Check if parent email already exists
    const existingParent = await query('SELECT * FROM parent WHERE email = ?', [email]);
    if (existingParent.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered. Please use a different email or try logging in.' 
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');
    
    // Insert parent record
    const parentResult = await query(
      'INSERT INTO parent (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    
    const parentId = parentResult.insertId;
    console.log('Parent created with ID:', parentId);
    
    // Handle profile picture
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = req.file.path.replace(/\\/g, '/'); // Normalize path separators
      console.log('Profile picture uploaded:', profilePicturePath);
    }
    
    let childId = null;
    let childrenArray = [];
    let activeChild = null;

    // Insert child record only if child data provided
    if (!isParentOnly) {
      const childResult = await query(
        'INSERT INTO child (parent_id, name, age, current_math_level, current_english_level, profile_picture) VALUES (?, ?, ?, 1, 1, ?)',
        [parentId, childName, parseInt(childAge), profilePicturePath]
      );
      
      childId = childResult.insertId;
      console.log('Child created with ID:', childId);

      activeChild = {
        id: childId,
        child_id: childId,
        name: childName,
        age: parseInt(childAge),
        current_math_level: 1,
        current_english_level: 1,
        total_points: 0,
        profile_picture: profilePicturePath
      };
      
      childrenArray = [activeChild];
    }

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
    
    // Return success response
    res.status(201).json({
      success: true,
      message: isParentOnly ? 'Parent account created successfully!' : 'Account created successfully! Welcome to SmartStep!',
      token: token,
      data: {
        parent: {
          id: parentId,
          email: email
        },
        children: childrenArray,
        activeChild: activeChild
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

// LOGIN ROUTE - Updated to support multiple children
router.post('/login', async (req, res) => {
  console.log('Login attempt for:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find parent by email
    const parents = await query('SELECT * FROM parent WHERE email = ?', [email]);
    if (parents.length === 0) {
      console.log('Parent not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const parent = parents[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, parent.password);
    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Get all children for this parent
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
    
    // Prepare children data
    const childrenData = children.map(child => ({
      id: child.child_id,
      child_id: child.child_id,
      name: child.name,
      age: child.age,
      current_math_level: child.current_math_level,
      current_english_level: child.current_english_level,
      total_points: child.total_points,
      profile_picture: child.profile_picture,
      // Keep backwards compatibility
      mathLevel: child.current_math_level,
      englishLevel: child.current_english_level,
      totalPoints: child.total_points
    }));
    
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      data: {
        parent: {
          id: parent.parent_id,
          email: parent.email
        },
        children: childrenData,
        activeChild: childrenData[0] || null,
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

// PROGRESS SAVING ROUTE
router.post('/save-progress', async (req, res) => {
  try {
    const { childId, activityType, level, sublevel, score, maxScore, passed } = req.body;
    
    console.log('Saving progress:', {
      childId,
      activityType,
      level,
      sublevel,
      score,
      maxScore,
      passed
    });

    // Create a unique activity identifier
    const activityName = `${activityType}_level_${level}_${sublevel || 1}`;
    
    // Check if progress already exists
    const existingProgress = await query(
      `SELECT progress_id, score, completed FROM child_progress 
       WHERE child_id = ? AND activity_id = (
         SELECT activity_id FROM activity WHERE name = ? LIMIT 1
       )`,
      [childId, activityName]
    );

    if (existingProgress.length > 0) {
      // Update existing progress if new score is better
      const currentBest = existingProgress[0].score;
      const shouldUpdate = score > currentBest || (!existingProgress[0].completed && passed);
      
      if (shouldUpdate) {
        await query(
          `UPDATE child_progress 
           SET score = ?, max_score = ?, completed = ?, attempts = attempts + 1, 
               last_attempt = CURRENT_TIMESTAMP, completed_at = ?
           WHERE progress_id = ?`,
          [score, maxScore, passed, passed ? new Date() : null, existingProgress[0].progress_id]
        );
        
        // Update child's level if they passed and it's higher than current
        if (passed && level >= 1) {
          await query(
            `UPDATE child SET current_math_level = GREATEST(current_math_level, ?), 
             total_points = total_points + ? WHERE child_id = ?`,
            [level + (passed ? 1 : 0), score, childId]
          );
        }
      } else {
        // Just increment attempts
        await query(
          `UPDATE child_progress SET attempts = attempts + 1, last_attempt = CURRENT_TIMESTAMP 
           WHERE progress_id = ?`,
          [existingProgress[0].progress_id]
        );
      }
    } else {
      // Create new activity if it doesn't exist
      await query(
        `INSERT IGNORE INTO activity (section_id, name, description, activity_type, points_value)
         VALUES (1, ?, ?, 'quiz', ?)`,
        [activityName, `${activityType} Level ${level} ${sublevel || ''}`, maxScore]
      );
      
      // Get the activity ID
      const activityResult = await query(
        `SELECT activity_id FROM activity WHERE name = ? LIMIT 1`,
        [activityName]
      );
      
      if (activityResult.length > 0) {
        const activityId = activityResult[0].activity_id;
        
        // Insert new progress
        await query(
          `INSERT INTO child_progress 
           (child_id, activity_id, completed, score, max_score, attempts, completed_at)
           VALUES (?, ?, ?, ?, ?, 1, ?)`,
          [childId, activityId, passed, score, maxScore, passed ? new Date() : null]
        );
        
        // Update child's level and points if passed
        if (passed && level >= 1) {
          await query(
            `UPDATE child SET current_math_level = GREATEST(current_math_level, ?), 
             total_points = total_points + ? WHERE child_id = ?`,
            [level + 1, score, childId]
          );
        }
      }
    }

    res.json({
      success: true,
      message: 'Progress saved successfully'
    });

  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving progress'
    });
  }
});

// GET CHILD PROGRESS ROUTE
router.get('/progress/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    
    const progress = await query(
      `SELECT cp.*, a.name as activity_name, a.activity_type, c.current_math_level, c.total_points
       FROM child_progress cp
       JOIN activity a ON cp.activity_id = a.activity_id
       JOIN child c ON cp.child_id = c.child_id
       WHERE cp.child_id = ?
       ORDER BY cp.last_attempt DESC`,
      [childId]
    );

    res.json({
      success: true,
      progress: progress
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress'
    });
  }
});

module.exports = router;