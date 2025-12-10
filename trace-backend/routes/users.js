const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/v1/users - Get all users
router.get('/', async (req, res) => {
  try {
    // This could be paginated in a real app
    const users = await db('users').select('*');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/users - Create a new user
router.post('/', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/v1/users/:id - Get a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/v1/users/:id - Update a user
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.update(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await User.delete(req.params.id);
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
