const jwt = require('jsonwebtoken');
const config = require('../config');
const { BadRequestError, ConflictError, UnauthorizedError, InternalServerError } = require('../errors/customErrors');
const UserService = require('../services/users.service');

const generateTokens = (user) => {
    const payload = { 
        userId: user.id,
        email: user.email 
    };

    const accessToken = jwt.sign(
        payload,
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiration }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiration }
    );

    return { accessToken, refreshToken };
};

const registerUser = async (email, password, name) => {
    try {
        const existingUser = await UserService.findByEmail(email);
        if (existingUser) {
            throw new ConflictError('Email is already in use');
        }

        const newUser = await UserService.createLocalUser( email, password, name );

        const { accessToken, refreshToken } = generateTokens(newUser);

        await UserService.addRefreshToken(newUser.id, refreshToken);

        return {
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.display_name
            },
            accessToken,
            refreshToken
        };
    } catch (err) {
        console.error('Error registering user:', err);
        throw new InternalServerError('Failed to register user');
    }
};

const refreshAccessToken = async (refreshToken) => {
    let payload;
    try {
        payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (err) {
        throw new UnauthorizedError('Invalid Refresh Token'); 
    }

    const user = await UserService.getUserById(payload.userId);
    if (!user || user.refresh_tokens.includes(refreshToken)) {
        throw new UnauthorizedError('Invalid Refresh Token');
    }

    const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiration }
    );

    return { user, accessToken: newAccessToken };
};

const logoutUser = async (refreshToken) => {
    let payload;
    try {
        payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (err) {
        throw new UnauthorizedError('Invalid Refresh Token'); 
    }
    return UserService.removeRefreshToken(payload.userId, refreshToken);
}

module.exports = {
    generateTokens,
    registerUser,
    refreshAccessToken,
    logoutUser
};