const MomentService = require('../services/moments.service');

const getAllMoments = async (req, res, next) => {
    try {
        const moments = await MomentService.getAllMoments();
        res.status(200).json(moments);
    } catch (error) {
        next(error);
    }
}

const getMomentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const moment = await MomentService.getMomentById(id);
        res.status(200).json(moment);
    } catch (error) {
        next(error);
    }
}

const createMoment = async (req, res, next) => {
    try {
        const newMoment = await MomentService.createMoment(req.body);
        res.status(201).json(newMoment);
    } catch (error) {
        next(error);
    }
}

const signBatch = async (req, res, next) => {
    const { activityId, files } = req.body; // Expecting array of { tempId, fileName, fileType, fileSize, lastModified }

    if (!activityId) {
        return res.status(400).json({ error: 'No activityId provided' });
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
    }
    if (files.length > 50) {
        return res.status(400).json({ error: 'Too many files. Maximum of 50 files allowed' });
    }

    try {
        const signedUrls = await MomentService.signBatch(activityId, files);
        res.status(200).json(signedUrls);
    } catch (err) {
        next(err);
    }
}

const confirmBatch = async (req, res, next) => {
    const { activityId, uploads } = req.body;
    // uploads: [{ momentId, meta: { lat, lon, alt, capturedAt }}, ...]

    if (!uploads || !Array.isArray(uploads) || uploads.length === 0) {
        return res.status(400).json({ error: 'No uploads provided' });
    }

    try {
        const confirmedUploads = await MomentService.confirmBatch(activityId, uploads);
        res.status(200).json(confirmedUploads);
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
