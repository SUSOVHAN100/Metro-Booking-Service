const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// ============ Google OAuth Routes ============

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
        session: false 
    }),
    (req, res) => {
        try {
            // Generate JWT token
            const token = generateToken(req.user._id);
            
            // Redirect to frontend with token
            res.redirect(`${process.env.CLIENT_URL}?token=${token}&user=${encodeURIComponent(JSON.stringify({
                userId: req.user.userId,
                name: req.user.name,
                email: req.user.email,
                avatar: req.user.avatar,
                role: req.user.role
            }))}`);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
        }
    }
);

// ============ Local Authentication Routes ============

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide all required fields' 
            });
        }
        
        // Check if user already exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already exists with this email' 
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const user = await User.create({
            userId: `U${Date.now().toString(36).toUpperCase()}`,
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            authProvider: 'local',
            lastLogin: new Date()
        });
        
        // Generate token
        const token = generateToken(user._id);
        
        res.status(201).json({
            success: true,
            token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                authProvider: user.authProvider
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during registration' 
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide email and password' 
            });
        }
        
        // Find user with password field
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            authProvider: 'local'
        }).select('+password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false, 
                error: 'Account is deactivated. Please contact admin.' 
            });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate token
        const token = generateToken(user._id);
        
        res.json({
            success: true,
            token,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                authProvider: user.authProvider
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error during login' 
        });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                userId: req.user.userId,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                avatar: req.user.avatar,
                role: req.user.role,
                authProvider: req.user.authProvider,
                createdAt: req.user.createdAt,
                lastLogin: req.user.lastLogin
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (name) user.name = name;
        if (phone) user.phone = phone;
        
        await user.save();
        
        res.json({
            success: true,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                authProvider: user.authProvider
            }
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
});

// @route   GET /api/auth/verify
// @desc    Verify token validity
// @access  Private
router.get('/verify', protect, (req, res) => {
    res.json({ 
        success: true, 
        valid: true,
        user: {
            userId: req.user.userId,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;
