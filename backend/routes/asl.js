const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for ASL video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.body.type || 'word'; // word, number, or operation
    const uploadPath = path.join(__dirname, `../../frontend/public/asl/${type}s`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const value = req.body.value;
    const ext = path.extname(file.originalname);
    cb(null, `${value}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// GET all ASL resources
router.get('/resources', async (req, res) => {
  try {
    const resources = await db.query('SELECT * FROM asl_resources ORDER BY type, value');
    res.json(resources);
  } catch (error) {
    console.error('Error fetching ASL resources:', error);
    res.status(500).json({ error: 'Failed to fetch ASL resources' });
  }
});

// GET ASL resource by type and value
router.get('/resources/:type/:value', async (req, res) => {
  try {
    const { type, value } = req.params;
    const resources = await db.query(
      'SELECT * FROM asl_resources WHERE type = ? AND (value = ? OR JSON_CONTAINS(aliases, ?))',
      [type, value, JSON.stringify(value)]
    );
    
    if (resources.length > 0) {
      res.json(resources[0]);
    } else {
      res.status(404).json({ error: 'Resource not found' });
    }
  } catch (error) {
    console.error('Error fetching ASL resource:', error);
    res.status(500).json({ error: 'Failed to fetch ASL resource' });
  }
});

// POST upload new ASL video
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { type, value, aliases } = req.body;
    
    if (!type || !value || !req.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const filename = req.file.filename;
    const aliasesJson = aliases ? JSON.stringify(aliases.split(',').map(a => a.trim())) : null;

    await db.query(
      `INSERT INTO asl_resources (type, value, filename, aliases) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE filename = ?, aliases = ?`,
      [type, value, filename, aliasesJson, filename, aliasesJson]
    );

    res.json({ 
      message: 'ASL video uploaded successfully',
      resource: { type, value, filename, aliases: aliasesJson }
    });
  } catch (error) {
    console.error('Error uploading ASL video:', error);
    res.status(500).json({ error: 'Failed to upload ASL video' });
  }
});

// PUT update ASL resource (mainly for updating aliases)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { aliases } = req.body;

    const aliasesJson = aliases ? JSON.stringify(aliases.split(',').map(a => a.trim())) : null;

    await db.query(
      'UPDATE asl_resources SET aliases = ? WHERE id = ?',
      [aliasesJson, id]
    );

    res.json({ message: 'ASL resource updated successfully' });
  } catch (error) {
    console.error('Error updating ASL resource:', error);
    res.status(500).json({ error: 'Failed to update ASL resource' });
  }
});

// DELETE ASL resource
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the resource details before deleting
    const resources = await db.query('SELECT * FROM asl_resources WHERE id = ?', [id]);
    
    if (resources.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const resource = resources[0];
    
    // Delete the file
    const filePath = path.join(__dirname, `../../frontend/public/asl/${resource.type}s/${resource.filename}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.query('DELETE FROM asl_resources WHERE id = ?', [id]);

    res.json({ message: 'ASL resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting ASL resource:', error);
    res.status(500).json({ error: 'Failed to delete ASL resource' });
  }
});

module.exports = router;
