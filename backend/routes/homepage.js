const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Public route - Get homepage settings for frontend display
router.get('/', async (req, res) => {
  try {
    const settings = await query('SELECT * FROM homepage_settings ORDER BY category, setting_key');
    
    // Convert to key-value object for easier use in frontend
    const settingsObject = settings.reduce((acc, setting) => {
      let value = setting.setting_value;
      
      // Parse JSON strings
      if (setting.setting_type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error(`Error parsing JSON for ${setting.setting_key}:`, e);
        }
      }
      
      // Convert boolean strings
      if (setting.setting_type === 'boolean') {
        value = value === 'true';
      }
      
      // Convert number strings
      if (setting.setting_type === 'number' && value) {
        value = Number(value);
      }
      
      acc[setting.setting_key] = value;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    console.error('Get homepage settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch homepage settings' 
    });
  }
});

module.exports = router;
