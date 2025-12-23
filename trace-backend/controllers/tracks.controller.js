const TracksService = require('../services/tracks.service');
const { isGpx, MAX_GPX_SIZE_BYTES } = require('../constants/mediaTypes');

const getAllTracks = async (req, res, next) => {
    try {
        const tracks = await TracksService.getAllTracks();
        res.status(200).json(tracks);
    } catch (error) {
        next(error);
    }
}

const getTrackById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const track = await TracksService.getTrackById(id);
        if (track) {
            res.status(200).json(track);
        } else {
            res.status(404).json({ message: 'Track not found' });
        }
    } catch (error) {
        next(error);
    }
}

const createTrack = async (req, res, next) => {
    try {
        const { name, description, activity_id } = req.body;
        const newTrack = await TracksService.createTrack({ name, description, activity_id });
        res.status(201).json(newTrack);
    } catch (error) {
        next(error);
    }
}

const uploadTrackFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Check field name is "file".' });
        }
        if (!isGpx(req.file.mimetype, req.file.originalname)) {
            return res.status(400).json({ error: 'File not valid. Please upload a gpx file.' });
        }
        if (req.file.size > MAX_GPX_SIZE_BYTES) {
            return res.status(400).json({ 
                error: `File is too large. Maximum size is ${MAX_GPX_SIZE_BYTES / 1024 / 1024} MB.`
            });
        }
        
        const newTrack = await TracksService.uploadTrackFile({
          file: req.file,
          activityId: req.body.activityId,
          name: req.body.name,
          description: req.body.description
        });
        
        res.json(newTrack);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
    uploadTrackFile,
}