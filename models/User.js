const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Local authentication fields
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        select: false // Don't return password by default
    },
    phone: String,
    
    // Google OAuth fields
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    avatar: String,
    
    // Account management
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate userId if not provided
userSchema.pre('save', function(next) {
    if (!this.userId) {
        const prefix = this.authProvider === 'google' ? 'G' : 'U';
        this.userId = `${prefix}${Date.now().toString(36).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);