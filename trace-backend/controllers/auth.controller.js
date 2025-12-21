const passport = require('passport');
const authService = require('../services/auth.service'); // For register logic
const usersService = require('../services/users.service'); // For saving refresh tokens
const { BadRequestError, UnauthorizedError } = require('../errors/customErrors');


const loginUser = (req, res, next) => {
    // 1. Pull the Trigger
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        
        // 2. Handle Errors from Strategy
        if (err) return next(err); // 500 Error
        
        // 3. Handle Failures (User not found / Wrong pass)
        if (!user) {
            return res.status(401).json({ 
                message: info ? info.message : 'Login failed' 
            });
        }

        // 4. Handle Success
        try {
            // Generate tokens
            // (You can move this helper to auth.service if you want, but it's fine here)
            const { accessToken, refreshToken } = authService.generateTokens(user);

            // Save Refresh Token (DB Call)
            await usersService.setUserRefreshToken(user.id, refreshToken);

            // Set Cookie
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None',
                maxAge: 24 * 60 * 60 * 1000
            });

            // Send Response
            res.json({
                message: 'Login successful',
                accessToken,
                user: { id: user.id, email: user.email, name: user.display_name }
            });

        } catch (error) {
            next(error);
        }
        
    })(req, res, next); // <--- IMPORTANT: Passing req/res to Passport
};

const registerUser = async (req, res, next) => {
    // Register is different! It doesn't need Passport middleware.
    // It's pure logic, so it stays cleanly in the Service.
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            throw new BadRequestError('Email, password, and name are required');
        }
        const result = await authService.registerUser(email, password, name);
        
        // Handle cookie here if you want auto-login on signup
        if (result.refreshToken) {
            res.cookie('jwt', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
        }

        res.status(201).json({
            accessToken: result.accessToken,
            user: result.user
        });
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        
        // 1. Check if cookie exists
        if (!cookies?.jwt) {
            throw new UnauthorizedError('Unauthorized');
        }

        const refreshToken = cookies.jwt;

        // 2. Delegate to Service
        // We expect the service to verify the token and return a new Access Token
        const result = await authService.refreshAccessToken(refreshToken);

        // 3. Respond with new Access Token
        res.json({ accessToken: result.accessToken });

    } catch (error) {
        next(error);
    }
};

const logoutUser = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204); // No content, already logged out

        const refreshToken = cookies.jwt;

        // 1. Service: Remove token from DB
        await authService.logoutUser(refreshToken);

        // 2. Clear the Cookie
        res.clearCookie('jwt', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None'
        });

        res.status(200).json({ message: 'Cookie cleared' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginUser,
    registerUser,
    refreshToken,
    logoutUser
};