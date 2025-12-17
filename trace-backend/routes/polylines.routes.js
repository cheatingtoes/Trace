const express = require('express');
const router = express.Router();
const PolylineController = require('../controllers/polylines.controller');

// GET /api/v1/polylines - Get all polylines
router.get('/', PolylineController.getAllPolylines);

// GET /api/v1/polylines/:id - Get a single user by ID
router.get('/:id', PolylineController.getPolylineById);

// POST /api/v1/polylines - Create a new user
router.post('/', PolylineController.createPolyline);

module.exports = router;