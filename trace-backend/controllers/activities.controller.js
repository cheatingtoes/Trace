const ActivityService = require('../services/activities.service');
const fs = require('fs');

const MAX_GPX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_GPX_MIME_TYPES = ['`application/gpx`+xml', '`application/xml`', '`text/xml`'];

const getAllActivities = async (req, res, next) => {
    try {
        const activities = await ActivityService.getAllActivities();
        res.status(200).json(activities);
    } catch (error) {
        next(error);
    }
}

const getActivityById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activity = await ActivityService.getActivityById(id);
        if (activity) {
            res.status(200).json(activity);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        next(error);
    }
}

const createActivity = async (req, res, next) => {
    try {
        const newActivity = await ActivityService.createActivity(req.body);
        res.status(201).json(newActivity);
    } catch (error) {
        next(error);
    }
}

const getActivityRoutes = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activityRoutes = await ActivityService.getActivityRoutes(id);
        res.status(200).json(activityRoutes);
    } catch (error) {
        next(error);
    }
}

const signBatch = async (req, res, next) => {
    const activityId = req.params.id;
    const { files } = req.body; // Expecting array of { fileName, fileType }

    if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
    }

    try {
        const signedUrls = await ActivityService.signBatch(activityId, files);
        res.json(signedUrls);
    } catch (err) {
        console.error("Batch Signing Error:", err);
        res.status(500).json({ error: 'Failed to generate signatures' });
    }
}

const uploadTrackFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Check field name is "file".' });
        }
        // if (!ALLOWED_GPX_MIME_TYPES.includes(req.file.mimetype)) {
        //     return res.status(400).json({ 
        //         error: `Invalid file type: '${req.file.mimetype}'. Only GPX files are accepted.`
        //     });
        // }

        if (req.file.size > MAX_GPX_SIZE_BYTES) {
            return res.status(400).json({ 
                error: `File is too large. Maximum size is ${MAX_GPX_SIZE_BYTES / 1024 / 1024} MB.`
            });
        }
        
        const newTrack = await ActivityService.uploadTrackFile({
          file: req.file,
          activityId: req.params.id,
          name: req.body.name,
          description: req.body.description
        });
        
        res.json(newTrack);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
    }
}

module.exports = {
    getAllActivities,
    getActivityById,
    createActivity,
    getActivityRoutes,
    signBatch,
    uploadTrackFile,
}
