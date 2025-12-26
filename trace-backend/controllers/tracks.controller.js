const TracksService = require('../services/tracks.service');
const { isGpx, MAX_GPX_SIZE_BYTES } = require('../constants/mediaTypes');
const { success } = require('../utils/apiResponse');
const { BadRequestError, NotFoundError } = require('../errors/customErrors');

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
        if (!req.file) {
            throw new BadRequestError('No file uploaded. Check field name is "file".');
        }
        if (!isGpx(req.file.mimetype, req.file.originalname)) {
            throw new BadRequestError('File not valid. Please upload a gpx file.');
        }
        if (req.file.size > MAX_GPX_SIZE_BYTES) {
            throw new BadRequestError(`File is too large. Maximum size is ${MAX_GPX_SIZE_BYTES / 1024 / 1024} MB.`);
        }
        
        const newTrack = await TracksService.uploadTrackFile({
          file: req.file,
          activityId: req.body.activityId,
          name: req.body.name,
          description: req.body.description
        });
        
        res.status(201).json(success(newTrack));
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
    deleteTrack,
    uploadTrackFile,
}
