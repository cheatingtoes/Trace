const MomentService = require('../services/moments.service');
const { ALLOWED_MIME_TYPES } = require('../constants/mediaTypes');

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
        if (moment) {
            res.status(200).json(moment);
        } else {
            res.status(404).json({ message: 'Moment not found' });
        }
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

const getPresignedUrl = async (req, res, next) => {
    const { activityId, fileName, fileType } = req.query;
    if (!activityId || !fileName || !fileType) {
        return res.status(400).send('Missing activityId, fileName, or fileType query parameter');
    }
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
        return res.status(400).json({ 
            error: `File type ${fileType} is not supported. Upload images, video, or audio recordings only.` 
        });
    }
    
    try {
        const presignedUrl = await MomentService.getPresignedUploadUrl({ activityId, fileName, fileType });
        res.status(200).json(presignedUrl);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllMoments,
    getMomentById,
    createMoment,
    getPresignedUrl,
}
