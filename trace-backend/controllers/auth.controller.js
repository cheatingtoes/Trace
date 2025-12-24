const passport = require('passport');
const authService = require('../services/auth.service');
const usersService = require('../services/users.service');
const { BadRequestError, UnauthorizedError } = require('../errors/customErrors');
const config = require('../config');
const { success } = require('../utils/apiResponse');

const isProduction = config.app.env === 'production';
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
};

const loginUser = (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({ 
                message: info ? info.message : 'Login failed' 
            });
        }
        try {
            const { accessToken, refreshToken } = authService.generateTokens(user);
            await usersService.addRefreshToken(user.id, refreshToken);

            res.cookie('jwt', refreshToken, {
                ...cookieOptions,
                maxAge: config.jwt.refreshMaxAge
            });

            res.status(200).json(success({
                accessToken,
                user: { id: user.id, email: user.email, name: user.displayName }
            }));
        } catch (error) {
            next(error);
        }
        
    })(req, res, next);
};

const registerUser = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            throw new BadRequestError('Email, password, and name are required');
        }
        if (password.length < 8) {
            throw new BadRequestError('Password must be at least 8 characters');
        }

        const result = await authService.registerUser(email, password, name);
        if (result.refreshToken) {
            res.cookie('jwt', result.refreshToken, {
                ...cookieOptions,
                maxAge: config.jwt.refreshMaxAge
            });
        }

        res.status(201).json(success({
            accessToken: result.accessToken,
            user: result.user
        }));
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            throw new UnauthorizedError('Unauthorized');
        }

        const refreshToken = cookies.jwt;
        const result = await authService.refreshAccessToken(refreshToken);
        res.status(200).json(success({ 
            accessToken: result.accessToken, 
            user: result.user 
        }));
    } catch (error) {
        next(error);
    }
};

const logoutUser = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204);

        const refreshToken = cookies.jwt;
        await authService.logoutUser(refreshToken);

        res.clearCookie('jwt', cookieOptions);
        res.status(200).json(success({ message: 'Cookie cleared' }));
    } catch (error) {
        next(error);
    }
};

const oauthCallback = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.redirect(`${config.oauth.frontendRedirectUrl}/login?error=auth_failed`);
        }
        const { accessToken, refreshToken } = authService.generateTokens(user);
        await usersService.addRefreshToken(user.id, refreshToken);

        res.cookie('jwt', refreshToken, {
            ...cookieOptions,
            maxAge: config.jwt.refreshMaxAge
        });

        res.redirect(config.oauth.frontendRedirectUrl);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginUser,
    registerUser,
    refreshToken,
    logoutUser,
    oauthCallback
};