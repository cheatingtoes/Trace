const TrackService = require('../services/tracks.service');

const getAllTracks = async (req, res, next) => {
    try {
        const tracks = await TrackService.getAllTracks();
        res.status(200).json(tracks);
    } catch (error) {
        next(error);
    }
}

const getTrackById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const track = await TrackService.getTrackById(id);
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
        const newTrack = await TrackService.createTrack({ name, description, activity_id });
        res.status(201).json(newTrack);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
}