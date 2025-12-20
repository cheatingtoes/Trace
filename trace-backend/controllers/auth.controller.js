const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const UserModel = require('../models/users.model');

// --- HELPER: Generate JWT ---
// This creates the "Badge" the user will carry.
// We only put the userId inside. Keep it small.
const generateToken = (user) => {
    // 1. The Payload: Who is this?
    const payload = { 
        userId: user.id,
        email: user.email 
    };

    // 2. The Settings
    const options = {
        expiresIn: '7d' // Token expires in 7 days
    };

    // 3. The Secret (Should be in .env)
    const secret = config.auth.jwtSecret;

    return jwt.sign(payload, secret, options);
};

// --- ACTION: Signup ---
const signup = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // 1. Basic Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 2. Check for existing user (Prevent duplicates)
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email is already in use' });
        }

        // 3. Create the User (Uses our Model logic)
        const newUser = await UserModel.createLocalUser({ 
            email, 
            password, 
            name 
        });

        // 4. Issue Token immediately so they don't have to login again
        const token = generateToken(newUser);

        // 5. Respond
        res.status(201).json({
            message: 'Signup successful',
            token: token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.display_name
            }
        });

    } catch (err) {
        next(err);
    }
};

// --- ACTION: Login ---
const login = (req, res, next) => {
    // We use a custom callback here to have full control over the JSON response
    // instead of Passport's default behavior.
    passport.authenticate('local', { session: false }, (err, user, info) => {
        // 1. System Error (DB down)
        if (err) { 
            return next(err); 
        }

        // 2. Auth Failed (Wrong password / User not found)
        // 'info' contains the message we set in passport.js ('Invalid login details')
        if (!user) {
            return res.status(401).json({ message: info ? info.message : 'Login failed' });
        }

        // 3. Auth Success: Issue Token
        const token = generateToken(user);

        return res.json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.display_name
            }
        });
    })(req, res, next); // <--- Note: We invoke the middleware function immediately
};

module.exports = {
    signup,
    login
};