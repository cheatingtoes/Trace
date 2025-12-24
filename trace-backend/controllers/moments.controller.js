const MomentService = require('../services/moments.service');
const { BadRequestError, InternalServerError } = require('../errors/customErrors');
const { success } = require('../utils/apiResponse');

const getAllMoments = async (req, res, next) => {
    try {
        const moments = await MomentService.getAllMoments();
        res.status(200).json(success(moments));
    } catch (error) {
        next(error);
    }
}

const getMomentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const moment = await MomentService.getMomentById(id);
        res.status(200).json(success(moment));
    } catch (error) {
        next(error);
    }
}

const createMoment = async (req, res, next) => {
    try {
        const newMoment = await MomentService.createMoment(req.body);
        res.status(201).json(success(newMoment));
    } catch (error) {
        next(error);
    }
}

const signBatch = async (req, res, next) => {
    const { id: userId } = req.user;
    const { activityId, files } = req.body; // Expecting array of { tempId, fileName, fileType, fileSize, lastModified }

    if (!userId) {
        throw new InternalServerError('userId not found in request')
    }
    if (!activityId) {
        throw new BadRequestError('No activityId provided')
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
        throw new BadRequestError('No files provided')
    }
    if (files.length > 50) {
        throw new BadRequestError('Too many files')
    }

    try {
        const signedUrls = await MomentService.signBatch(userId, activityId, files);
        res.status(200).json(success(signedUrls));
    } catch (err) {
        next(err);
    }
}

const confirmBatch = async (req, res, next) => {
    const { id: userId } = req.user;
    const { activityId, uploads } = req.body;
    // uploads: [{ momentId, meta: { lat, lon, alt, capturedAt }}, ...]

    if (!userId) {
        throw new InternalServerError('userId not found in request')
    }
    if (!uploads || !Array.isArray(uploads) || uploads.length === 0) {
        throw new BadRequestError('No uploads provided')
    }
    if (uploads.length > 50) {
        throw new BadRequestError('Too many uploads')
    }
    if (!activityId) {
        throw new BadRequestError('No activityId provided')
    }

    try {
        const confirmedUploads = await MomentService.confirmBatch(userId, activityId, uploads);
        res.status(200).json(success(confirmedUploads));
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllMoments,
    getMomentById,
    createMoment,
    signBatch,
    confirmBatch,
}