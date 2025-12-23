const express = require('express');
const router = express.Router();
const passport = require('passport');
const AuthController = require('../controllers/auth.controller');

router.post('/register', AuthController.registerUser);

router.post('/login', AuthController.loginUser);

router.post('/refresh', AuthController.refreshToken);

router.post('/logout', AuthController.logoutUser);

router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    AuthController.oauthCallback
);

// router.get('/apple', 
//     passport.authenticate('apple')
// );

// router.post('/apple/callback', 
//     passport.authenticate('apple', { session: false, failureRedirect: '/login' }),
//     AuthController.oauthCallback
// );

module.exports = router;