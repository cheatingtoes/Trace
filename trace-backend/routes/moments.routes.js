const express = require('express');
const router = express.Router();
const MomentController = require('../controllers/moments.controller');

// GET /api/v1/moments - Get all moments
router.get('/', MomentController.getAllMoments);

// GET /api/v1/moments/:id - Get a single moment by ID
router.get('/:id', MomentController.getMomentById);

// POST /api/v1/moments - Create a new moment
router.post('/', MomentController.createMoment);

module.exports = router;