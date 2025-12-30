const { uuidv7 } = require('uuidv7');
const mime = require('mime-types');
const MomentModel = require('../models/moments.model');
const s3Service = require('../services/s3.service');
const { NotFoundError, BadRequestError, InternalServerError } = require('../errors/customErrors');
const { ALLOWED_MIME_TYPES, IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES } = require('../constants/mediaTypes');
const { imageQueue, videoQueue } = require('../jobs/queues');

const getAllMoments = async () => {
    return MomentModel.getAllMoments();
};

const getMomentById = async (id) => {
    const moment = await MomentModel.getMomentById(id);
    if (!moment) {
        throw new NotFoundError(`Moment with ID ${id} not found.`);
    }
    return moment;
};

const getMomentByIds = async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('No ids provided');
    }
    return MomentModel.getMomentByIds(ids);
};

const getMomentsByStatus = async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('No ids provided');
    }
    return MomentModel.getMomentsByStatus(ids);
};

const getMomentsByActivityId = async (activityId) => {
    return MomentModel.getMomentsByActivityId(activityId);
};

const createMoment = async (momentData) => {
    const id = uuidv7();
    return MomentModel.createMoment({ id, ...momentData });
};

const updateMoment = async (id, updates) => {
    const [updatedMoment] = await MomentModel.update(id, updates);
    if (!updatedMoment) {
        throw new NotFoundError(`Moment with ID ${id} not found.`);
    }
    return updatedMoment;
};

const bulkUpdate = async (updates) => {
    const updatedMoments = await MomentModel.bulkUpdate(updates);
    return updatedMoments;
}

const updateStatus = async (id, status) => {
    return MomentModel.updateStatus(id, status);
};

const deleteMoment = async (id) => {
    const moment = await MomentModel.deleteMoment(id);
    if (!moment) {
        throw new NotFoundError('Moment not found');
    }
    return moment;
};

const deleteMomentsByActivityId = async (activityId) => {
    return MomentModel.deleteMomentsByActivityId(activityId);
}

const signBatch = async (userId, activityId, files) => {
    try {
        const signedUrls = await Promise.all(files.map(async (file) => {
            try {
                const { fileName = '', fileType, fileSize, tempId } = file;

                const missingFields = ['fileName', 'fileType', 'fileSize', 'tempId'].filter(field => !file[field]);

                if (missingFields.length > 0) {
                    console.error(`File ${fileName} is missing required fields: ${missingFields.join(', ')}`);
                    return {
                        tempId,
                        status: 'error',
                        message: `Missing required fields: ${missingFields.join(', ')}`
                    }
                }

                if (!ALLOWED_MIME_TYPES.includes(fileType)) {
                    console.error(`Unsupported type: ${fileType}`)
                    return {
                        tempId,
                        status: 'error',
                        fileName: fileName,
                        message: `Unsupported type: ${fileType}`
                    };
                }

                let type;
                if (IMAGE_TYPES.includes(fileType)) {
                    type = 'image';
                } else if (VIDEO_TYPES.includes(fileType)) {
                    type = 'video';
                } else if (AUDIO_TYPES.includes(fileType)) {
                    type = 'audio';
                }

                const [existingMoment] = await MomentModel.findDuplicateMoment({
                    activityId,
                    name: fileName,
                    fileSizeBytes: fileSize
                });

                if (existingMoment) {
                    if (existingMoment.status === 'processing' || existingMoment.status === 'active') {
                        return {
                            tempId,
                            // not a real status in DB
                            status: 'duplicate',
                            activityId,
                            signedUrl: null,
                        };
                    }
                }
                const id = uuidv7();
                const ext = mime.extension(fileType);
                const key = `${userId}/activities/${activityId}/${type}s/${id}.${ext}`

                const signedUrl = await s3Service.getPresignedUploadUrl(key, fileType);
                const [newMoment] = await MomentModel.createMoment({
                    id,
                    activityId,
                    status: 'pending',
                    name: fileName,
                    fileSizeBytes: fileSize,
                    type,
                    storage_key: key
                });

                return {
                    tempId,
                    id,
                    status: 'pending',
                    activityId,
                    signedUrl,
                    key
                };
            } catch (err) {
                console.error(`Failed to process file ${file.fileName}:`, err);
                return {
                    tempId: file.tempId,
                    status: 'error',
                    message: 'Failed to process. Please try again.'
                }
            }
        }));

        return signedUrls;
    } catch (err) {
        if (err instanceof BadRequestError) {
            throw err;
        }
        
        console.error(`Error during signBatch for activity ${activityId}:`, err);
        throw new InternalServerError('An unexpected error occurred while processing the batch.');
    }
}

const confirmBatch = async (userId, activityId, uploads) => {
    // uploads: [{ momentId, meta: { lat, lon, alt, capturedAt }}, ...]
    const momentIds = uploads.map(u => u.momentId);

    try {
        const activeMoments = await MomentModel.confirmBatchUploads(activityId, momentIds);
        activeMoments.forEach(({ id, type, storageKey }) => {
            if (type === 'image') {
                console.log({ momentId: id, storageKey, activityId })
                imageQueue.add('process-image', { momentId: id, storageKey, activityId });
            } else if (type === 'video') {
                videoQueue.add('process-video', { momentId: id, storageKey, activityId });
            }
        });

        return activeMoments.map(m => m.id);
    } catch (err) {
        console.error(`Error during confirmBatch for activity ${activityId}:`, err);
        throw new InternalServerError('An unexpected error occurred while confirming the batch.');
    }
};

module.exports = {
  getAllMoments,
  getMomentById,
  getMomentByIds,
  getMomentsByActivityId,
  getMomentsByStatus,
  createMoment,
  updateMoment,
  bulkUpdate,
  updateStatus,
  deleteMoment,
  deleteMomentsByActivityId,
  signBatch,
  confirmBatch,
};