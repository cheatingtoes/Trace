const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

router.post('/signup', AuthController.registerUser);

router.post('/login', AuthController.loginUser);

router.post('/refresh', AuthController.refreshToken);

router.post('/logout', AuthController.logoutUser);

module.exports = router;