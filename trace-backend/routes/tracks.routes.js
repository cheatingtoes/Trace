const express = require('express');
const router = express.Router();
const multer = require('multer');
const TracksController = require('../controllers/tracks.controller');
const authenticate = require('../middleware/auth');

router.use(authenticate);

const upload = multer({ dest: 'temp_uploads/' });

// GET /api/v1/tracks - Get all tracks
router.get('/', TracksController.getAllTracks);

// GET /api/v1/tracks/:id - Get a single track by ID
router.get('/:id', TracksController.getTrackById);

// POST /api/v1/tracks - Create a new track
router.post('/', TracksController.createTrack);

router.delete('/:id', TracksController.deleteTrack);

// POST /api/v1/tracks/upload-track-file - Upload a GPX file to create a track
router.post('/upload-track-file', upload.single('file'), TracksController.uploadTrackFile);

router.post('/upload-url', TracksController.getTrackUploadUrl);
router.post('/confirm-upload', TracksController.confirmUpload);
router.post('/status-batch', TracksController.getTracksByStatus);

module.exports = router;