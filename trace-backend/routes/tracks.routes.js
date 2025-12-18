const express = require('express');
const router = express.Router();
const TrackController = require('../controllers/tracks.controller');

// GET /api/v1/users - Get all users
router.get('/', TrackController.getAllTracks);

// GET /api/v1/users/:id - Get a single user by ID
router.get('/:id', TrackController.getTrackById);

// POST /api/v1/users - Create a new user
router.post('/', TrackController.createTrack);

module.exports = router;