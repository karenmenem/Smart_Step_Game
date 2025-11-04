const jwt = require('jsonwebtoken');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartstep-secret-key-2024');
    
    // Check if it's an admin token
    if (!decoded.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = { adminAuth };
