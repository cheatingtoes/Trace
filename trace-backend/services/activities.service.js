const s3Service = require('../services/s3.service');
const ActivityModel = require('../models/activities.model');
const MomentModel = require('../models/moments.model');
const TrackModel = require('../models/tracks.model');
const { ALLOWED_MIME_TYPES, IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES } = require('../constants/mediaTypes');
const { imageQueue, videoQueue } = require('../jobs/queues');

const getAllActivities = async () => {
    return ActivityModel.getAllActivities();
};

const getActivityById = async (id) => {
    return ActivityModel.getActivityById(id);
};

const createActivity = async (activityData) => {
    return ActivityModel.createActivity(activityData);
};

const getActivityRoutes = async (id) => {
    return TrackModel.getTracksByActivityId(id);
};

const signBatch = async (activityId, files) => {
    // Use Promise.all to run all signatures in parallel
    const signedUrls = await Promise.all(files.map(async (file) => {
        const { fileName, fileType, fileSize, tempId, lastModified } = file; // Expecting array of { tempId, fileName, fileType, fileSize, lastModified }
        // 1. Validate Type
        if (!ALLOWED_MIME_TYPES.includes(fileType)) {
            return {
                error: true,
                fileName: fileName,
                message: `Unsupported type: ${fileType}`
            };
        }

        // 2. check for dupes
        const [existingMoment] = await MomentModel.findDuplicateMoment({
            activity_id: activityId,
            original_filename: fileName,
            file_size_bytes: fileSize
        });
        if (existingMoment) {
            return {
                tempId,
                status: 'exists',
                momentId: existingMoment.id,
                signedUrl: null,
                key: existingMoment.s3_key
            }
        }
        const { signedUrl, key } = await s3Service.getPresignedUploadUrl({ entityType: 'activities', entityId: activityId, fileName, fileType });

        let type;
        if (IMAGE_TYPES.includes(fileType)) {
            type = 'image';
        } else if (VIDEO_TYPES.includes(fileType)) {
            type = 'video';
        } else if (AUDIO_TYPES.includes(fileType)) {
            type = 'audio';
        }

        const [newMoment] = await MomentModel.createMoment({
            activity_id: activityId,
            status: 'pending',
            original_filename: fileName,
            file_size_bytes: fileSize,
            type,
            timestamp: new Date(lastModified || Date.now()),
            metadata: {
                mime_type: fileType
            },
            s3_key: key
        });

        return {
            tempId,
            status: 'pending',
            momentId: newMoment.id,
            signedUrl,
            key
        };
    }));

    return signedUrls;
}

const confirmBatch = async (activityId, uploads) => {
    // uploads: [{ momentId, meta: { lat, lon, alt, capturedAt }}, ...]
    const momentIds = uploads.map(u => u.momentId);

    try {
        // 2. The "Bulk Commit"
        // Update ONLY if the photo belongs to this activity (Security Check)
        // AND currently has status 'pending' (Idempotency Check)
        const confirmedCount = await MomentModel.confirmBatchUploads(activityId, momentIds);

        // 3. (Optional) Save EXIF/GPS Data
        // If your frontend sent GPS data, you iterate and update. 
        // Note: Doing this in a loop is fine for batch size 50.
        // For higher scale, use a sophisticated bulk upsert or a background job.
        const metaUpdates = uploads
            .filter(u => u.meta && (u.meta.lat || u.meta.capturedAt))
            .map(u => MomentModel.updateMetadata(u.momentId, u.meta));
        await Promise.all(metaUpdates);

        confirmedCount.forEach(({ id, type, s3_key }) => {
            if (type === 'image') {
                imageQueue.add({ momentId: id, s3_key });
            } else if (type === 'video') {
                videoQueue.add({ momentId: id, s3_key });
            }
        });
            
        // 4. Trigger Background Jobs (Thumbnails)
        // Since this is a map app, you need small images for pins.
        // Don't await this! Fire and forget.
        // momentIds.forEach(id => {
        //     thumbnailQueue.add({ momentId: id });
        // });

        return res.json({ 
            success: true, 
            count: confirmedCount.length
        });
    } catch (err) {
        console.error("Confirmation Failed", err);
        return res.status(500).json({ error: "Failed to confirm uploads" });
    }
};


module.exports = {
    getAllActivities,
    getActivityById,
    createActivity,
    getActivityRoutes,
    signBatch,
};