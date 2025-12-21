const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy; // 👈 NEW
const ExtractJwt = require('passport-jwt').ExtractJwt; // 👈 NEW
const UserModel = require('../models/users.model');
const config = require('./index');

/**
 * ==============================================
 * STRATEGY 1: LOCAL LOGIN (Email + Password)
 * Used when user tries to sign in.
 * ==============================================
 */
const localOptions = { 
    usernameField: 'email',
    passwordField: 'password'
};

const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
    try {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return done(null, false, { message: 'Invalid login details' });
        }

        const isMatch = await UserModel.verifyPassword(user, password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid login details' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

/**
 * ==============================================
 * STRATEGY 2: JWT AUTH (Protected Routes)
 * Used when user sends an "Authorization: Bearer <token>" header.
 * ==============================================
 */
const jwtOptions = {
    // Tell Passport to look for the token in the 'Authorization' header
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    // Use the ACCESS secret to verify the signature
    secretOrKey: config.jwt.accessSecret
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        // payload.userId comes from the token we created in auth.controller
        const user = await UserModel.getUserById(payload.userId);

        if (user) {
            return done(null, user); // User found, request is authorized
        } else {
            return done(null, false); // User deleted or invalid
        }
    } catch (err) {
        return done(err, false);
    }
});

// Register both strategies
passport.use(localLogin);
passport.use(jwtLogin);