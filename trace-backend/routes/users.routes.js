const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users.controller');
const authenticate = require('../middleware/auth');

router.use(authenticate);

// GET /api/v1/users - Get all users
router.get('/', UserController.getAllUsers);

// GET /api/v1/users/:id - Get a single user by ID
router.get('/:id', UserController.getUserById);

// POST /api/v1/users - Create a new user
router.post('/', UserController.createUser);

router.post('/login', UserController.login);

module.exports = router;