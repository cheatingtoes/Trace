const TracksService = require('../services/tracks.service');
const { gpxQueue } = require('../jobs/queues');
const { success } = require('../utils/apiResponse');
const { getPresignedUploadUrl } = require('../services/s3.service');
const { NotFoundError } = require('../errors/customErrors');

const getAllTracks = async (req, res, next) => {
    try {
        const tracks = await TracksService.getAllTracks();
        res.status(200).json(success(tracks));
    } catch (error) {
        next(error);
    }
}

const getTrackById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const track = await TracksService.getTrackById(id);
        if (track) {
            res.status(200).json(success(track));
        } else {
            throw new NotFoundError('Track not found');
        }
    } catch (error) {
        next(error);
    }
}

const createTrack = async (req, res, next) => {
    try {
        const { name, description, activityId } = req.body;
        const newTrack = await TracksService.createTrack({ name, description, activityId });
        res.status(201).json(success(newTrack));
    } catch (error) {
        next(error);
    }
}

const updateTrack = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedTrack = await TracksService.updateTrack(id, req.body);
        res.status(200).json(success(updatedTrack));
    } catch (error) {
        next(error);
    }
};

const deleteTrack = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedTrack = await TracksService.deleteTrack(id);
        if (deletedTrack) {
            res.status(200).json(success(deletedTrack));
        } else {
            throw new NotFoundError('Track not found');
        }
    } catch (error) {
        next(error);
    }
}

const uploadTrackFile = async (req, res, next) => {
    try {
        const newTrack = await TracksService.uploadTrackFile({
          file: req.file,
          activityId: req.body.activityId,
          name: req.body.name,
          description: req.body.description,
          userId: req.user.id
        });
        
        res.status(201).json(success(newTrack));
    } catch (err) {
        next(err);
    }
}

// 1. GET /tracks/upload-url
const getTrackUploadUrl = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { activityId, file } = req.body;
        
        const payload = await TracksService.getTrackUploadUrl(id, activityId, file);
        res.json(success(payload));
    } catch (err) {
        next(err);
    }
};

// 2. POST /tracks/finalize-upload
const confirmUpload = async (req, res, next) => {
    try {
        const { key, trackId, polylineId } = req.body;

        // A. Create the Track entry in DB (Status: 'processing')
        // const newTrack = await TracksService.createTrack({ 
        //    name, description, activityId, status: 'processing' 
        // });
        
        // B. Add to Queue
        const track = await TracksService.confirmUpload(trackId, polylineId, key);

        res.status(202).json(success({ 
            message: 'Track is processing', 
            track,
        }));
    } catch (err) {
        next(err);
    }
};

const getTracksByStatus = async (req, res, next) => {
    try {
        const { ids } = req.body;
        const tracks = await TracksService.getTracksByStatus(ids);
        res.status(200).json(success(tracks));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
    updateTrack,
    deleteTrack,
    uploadTrackFile,
    getTrackUploadUrl,
    confirmUpload,
    getTracksByStatus
}
