const jwt = require('jsonwebtoken');

// JWT Authentication middleware
const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token (without password)
            const User = require('../models/User');
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'User not found' 
                });
            }
            
            if (!req.user.isActive) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Account is deactivated' 
                });
            }
            
            next();
        } catch (error) {
            console.error('Auth Error:', error);
            return res.status(401).json({ 
                success: false, 
                error: 'Not authorized - Invalid token' 
            });
        }
    } else if (req.isAuthenticated && req.isAuthenticated()) {
        // For session-based auth (Google OAuth)
        next();
    } else {
        return res.status(401).json({ 
            success: false, 
            error: 'Not authorized - No token provided' 
        });
    }
};

// Check if user is admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            error: 'Not authorized as admin' 
        });
    }
};

// Optional auth - doesn't error if no token
const optionalAuth = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const User = require('../models/User');
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Ignore token errors for optional auth
        }
    }
    
    next();
};

module.exports = { protect, admin, optionalAuth };
