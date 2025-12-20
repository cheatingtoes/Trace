const jwt = require('jsonwebtoken');
const config = require('../config');

// Ensure this matches the secret used in your auth.controller.js
const JWT_SECRET = config.auth.jwtSecret;

const authenticate = (req, res, next) => {
    // --- DEV MODE BACKDOOR ---
    // Add BYPASS_AUTH=true to your .env file to skip login checks
    if (config.auth.bypassAuth === true) {
        req.user = { 
            userId: '550e8400-e29b-41d4-a716-446655440000', // Fake UUID
            email: 'dev@test.com' 
        };
        return next();
    }
    // -------------------------

    // 1. Get the token from the header
    // The frontend sends: "Authorization: Bearer <token_string>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Extract the actual token string (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verify the token signature
        // If the token was messed with or expired, this throws an error.
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Attach the user payload to the request
        // Now 'req.user' is available in your controllers!
        // decoded looks like: { userId: 'uuid...', email: '...', iat: ..., exp: ... }
        req.user = decoded;

        // 4. Move to the next middleware (or controller)
        next();
    } catch (err) {
        console.error('Auth Error:', err.message);
        return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    }
};

module.exports = authenticate;