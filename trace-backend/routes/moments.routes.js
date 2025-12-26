const express = require('express');
const router = express.Router();
const MomentController = require('../controllers/moments.controller');
const authenticate = require('../middleware/auth');

router.use(authenticate);

// GET /api/v1/moments - Get all moments
router.get('/', MomentController.getAllMoments);

router.post('/', MomentController.getMomentByIds);

// GET /api/v1/moments/:id - Get a single moment by ID
router.get('/:id', MomentController.getMomentById);

// POST /api/v1/moments - Create a new moment
router.post('/', MomentController.createMoment);

router.delete('/:id', MomentController.deleteMoment);

// 1. Sign Batch (Get URLs)
router.post('/sign-batch', MomentController.signBatch);

// 2. Confirm Batch (Trigger Workers)
router.post('/confirm-batch', MomentController.confirmBatch);

// 3. Get status of Ids
router.post('/status-batch', MomentController.getMomentsByStatus);

module.exports = router;