const express = require('express');
const router = express.Router();
const multer = require('multer');
const ActivityController = require('../controllers/activities.controller');
const authenticate = require('../middleware/auth');

router.use(authenticate);

const upload = multer({ dest: 'uploads/' }); // Temp storage

// GET /api/v1/activities - Get all activities
router.get('/', ActivityController.getAllActivities);

// GET /api/v1/activities/:id - Get a single activity by ID
router.get('/:id', ActivityController.getActivityById);

// POST /api/v1/activities - Create a new activity
router.post('/', ActivityController.createActivity);

// GET /api/v1/activities/:id/routes - Get all routes for an activity
router.get('/:id/routes', ActivityController.getActivityRoutes);

// POST /api/v1/activities/:id/upload-track-file - Upload a GPX file to create a track
router.post('/:id/upload-track-file', upload.single('file'), ActivityController.uploadTrackFile);

module.exports = router;