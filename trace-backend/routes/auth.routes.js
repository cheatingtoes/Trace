const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// POST /auth/signup
router.post('/signup', AuthController.signup);

// POST /auth/login
router.post('/login', AuthController.login);

module.exports = router;