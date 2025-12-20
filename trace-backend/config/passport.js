const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../models/users.model'); // Adjust path if needed

/**
 * 1. Configure the "Local" Strategy
 * This tells Passport how to handle 'email' + 'password' login attempts.
 */
const localOptions = { 
    usernameField: 'email', // We accept 'email', not 'username'
    passwordField: 'password' // (Default, but good to be explicit)
};

const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
    try {
        // Step 1: Find the user by email
        const user = await UserModel.findByEmail(email);
        
        // Edge Case: User not found
        // done(error, user, info)
        if (!user) {
            return done(null, false, { message: 'Invalid login details' });
        }

        // Step 2: Verify password
        const isMatch = await UserModel.verifyPassword(user, password);
        
        // Edge Case: Wrong password
        if (!isMatch) {
            return done(null, false, { message: 'Invalid login details' });
        }

        // Success: Return the user object
        // This will be passed to your Controller as 'req.user'
        return done(null, user);

    } catch (err) {
        // System Error (DB is down, etc)
        return done(err);
    }
});

// Register the strategy with Passport
passport.use(localLogin);

// Note: We do NOT need serializeUser/deserializeUser because we are using JWTs.
// We are not creating a persistent server session.