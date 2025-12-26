const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activities.controller');
const authenticate = require('../middleware/auth');

router.use(authenticate);

// GET /api/v1/activities - Get all activities for a user
router.get('/', ActivityController.getActivitiesForUser);

// GET /api/v1/activities/:id - Get a single activity by ID
router.get('/:id', ActivityController.getActivityById);

// POST /api/v1/activities - Create a new activity
router.post('/', ActivityController.createActivity);

// GET /api/v1/activities/:id/tracks - Get all tracks for an activity
router.get('/:id/tracks', ActivityController.getTracksByActivityId);

router.delete('/:id/tracks', ActivityController.deleteTracksByActivityId);

// GET /api/v1/activities/:id/moments - Get all moments for an activity
router.get('/:id/moments', ActivityController.getMomentsByActivityId);

router.delete('/:id/moments', ActivityController.deleteMomentsByActivityId);

module.exports = router;