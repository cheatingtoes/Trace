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

const createMoment = async (momentData) => {
    const id = uuidv7();
    return MomentModel.createMoment({ id, ...momentData });
};

const signBatch = async (userId, activityId, files) => {
    try {
        const signedUrls = await Promise.all(files.map(async (file) => {
            try {
                const { fileName, fileType, fileSize, tempId } = file;

                if (!fileName || !fileType || !fileSize || !tempId) {
                    return {
                        tempId,
                        status: 'error',
                        message: 'Missing required fields'
                    }
                }

                if (!ALLOWED_MIME_TYPES.includes(fileType)) {
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
                    activity_id: activityId,
                    name: fileName,
                    file_size_bytes: fileSize
                });

                if (existingMoment) {
                    return {
                        tempId,
                        // not a real status in DB
                        status: 'duplicate',
                        activityId: activityId,
                        signedUrl: null,
                        key: existingMoment.s3_key
                    };
                }
                const id = uuidv7();
                const ext = mime.extension(fileType);
                const s3Key = `${userId}/activities/${activityId}/${type}s/${id}.${ext}`

                const { signedUrl, key } = await s3Service.getPresignedUploadUrl(s3Key, fileType);
                const [newMoment] = await MomentModel.createMoment({
                    id,
                    activity_id: activityId,
                    status: 'pending',
                    name: fileName,
                    file_size_bytes: fileSize,
                    type,
                    s3_key: key
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
        activeMoments.forEach(({ id, type, s3_key }) => {
            if (type === 'image') {
                imageQueue.add('process-image', { momentId: id, s3_key });
            } else if (type === 'video') {
                videoQueue.add('process-video', { momentId: id, s3_key });
            }
        });

        return { 
            success: true, 
            count: activeMoments.length
        };
    } catch (err) {
        console.error(`Error during confirmBatch for activity ${activityId}:`, err);
        throw new InternalServerError('An unexpected error occurred while confirming the batch.');
    }
};

module.exports = {
  getAllMoments,
  getMomentById,
  createMoment,
  signBatch,
  confirmBatch,
};