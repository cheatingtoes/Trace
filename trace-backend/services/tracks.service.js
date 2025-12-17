const db = require('../config/db');
const TrackModel = require('../models/tracks.model');

const getAllTracks = () => {
    return TrackModel.getAllTracks();
};

const getTrackById = (id) => {
    return TrackModel.getTrackById(id);
};

const createTrack = (trackData) => {
    return TrackModel.createTrack(trackData);
};

module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
};