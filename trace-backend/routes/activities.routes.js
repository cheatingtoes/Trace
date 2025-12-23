const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activities.controller');
const authenticate = require('../middleware/auth');

router.use(authenticate);

// GET /api/v1/activities - Get all activities
router.get('/', ActivityController.getAllActivities);

// GET /api/v1/activities/:id - Get a single activity by ID
router.get('/:id', ActivityController.getActivityById);

// POST /api/v1/activities - Create a new activity
router.post('/', ActivityController.createActivity);

// GET /api/v1/activities/:id/routes - Get all routes for an activity
router.get('/:id/routes', ActivityController.getActivityRoutes);

module.exports = router;