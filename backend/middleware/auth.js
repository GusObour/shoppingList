const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.error('Auth middleware error: User not found for token');
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      next();
    } catch (error) {
      // Provide specific error messages for different JWT errors
      let message = 'Not authorized, token failed';
      
      if (error.name === 'TokenExpiredError') {
        message = 'Token expired';
        console.error(`Auth middleware error: jwt expired at ${error.expiredAt}`);
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        console.error('Auth middleware error:', error.message);
      } else if (error.name === 'NotBeforeError') {
        message = 'Token not active yet';
        console.error('Auth middleware error:', error.message);
      } else {
        console.error('Auth middleware error:', error.message);
      }
      
      return res.status(401).json({
        success: false,
        message,
        error: error.name,
      });
    }
  }

  if (!token) {
    console.warn('Auth middleware: No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

module.exports = { protect };
