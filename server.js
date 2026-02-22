const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// Session configuration (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'metro-booking-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport configuration
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    initializeSampleData();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Import routes
const authRoutes = require('./routes/auth');
const stopsRoutes = require('./routes/stops');
const routesRoutes = require('./routes/routes');
const bookingsRoutes = require('./routes/bookings');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/stops', stopsRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/bookings', bookingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
    });
});

// Initialize sample data
async function initializeSampleData() {
    try {
        const Stop = require('./models/Stop');
        const Route = require('./models/Route');
        
        const stopsCount = await Stop.countDocuments();
        const routesCount = await Route.countDocuments();
        
        if (stopsCount === 0 && routesCount === 0) {
            console.log('Initializing sample metro data...');
            const sampleData = require('./data/sampleData');
            
            // Insert stops
            await Stop.insertMany(sampleData.stops);
            
            // Insert routes
            await Route.insertMany(sampleData.routes);
            
            console.log('Sample data initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
});
