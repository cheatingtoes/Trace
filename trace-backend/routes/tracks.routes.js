const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const TrackController = require('../controllers/tracks.controller');

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(__dirname, '../../tmp_uploads')),
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    files: 1,
});

// GET /api/v1/users - Get all users
router.get('/', TrackController.getAllTracks);

// GET /api/v1/users/:id - Get a single user by ID
router.get('/:id', TrackController.getTrackById);

// POST /api/v1/users - Create a new user
router.post('/', TrackController.createTrack);

router.post('/:id/upload-gpx', upload.single('file'), TrackController.uploadGPX);

module.exports = router;