const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ 
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value }
                ]
            });

            if (user) {
                // Update existing user with Google info if needed
                if (!user.googleId) {
                    user.googleId = profile.id;
                    user.authProvider = 'google';
                    user.avatar = profile.photos[0]?.value;
                    await user.save();
                }
                
                // Update last login
                user.lastLogin = new Date();
                await user.save();
                
                return done(null, user);
            }

            // Create new user
            const newUser = new User({
                userId: `G${Date.now().toString(36).toUpperCase()}`,
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0]?.value,
                authProvider: 'google',
                lastLogin: new Date()
            });

            await newUser.save();
            done(null, newUser);
        } catch (error) {
            console.error('Google OAuth Error:', error);
            done(error, null);
        }
    }));

    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
