const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');
const toGeoJSON = require('@mapbox/togeojson');

const db = require('../config/db');
const { BUCKET_NAME } = require('../config/s3');
const s3Service = require('../services/s3.service');
const ActivityModel = require('../models/activities.model');
const TrackModel = require('../models/tracks.model');
const { ALLOWED_MIME_TYPES } = require('../constants/mediaTypes');

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
        const { fileName, fileType } = file;
        // 1. Validate Type
        if (!ALLOWED_MIME_TYPES.includes(fileType)) {
            return {
                error: true,
                fileName: fileName,
                message: `Unsupported type: ${fileType}`
            };
        }

        const { signedUrl, key } = await s3Service.getPresignedUploadUrl({ entityType: 'activities', entityId: activityId, fileName, fileType });

        return {
            originalName: fileName, // Send this back so Frontend can match file to URL
            fileType: fileType,
            signedUrl,
            key
        };
    }));

    return signedUrls;
}

async function uploadTrackFile({ file, activityId, name, description }) {
    try {
        // A. Read the file as a simple string
        const gpxString = fs.readFileSync(file.path, 'utf8');
        // B. Parse string -> DOM Node (This is the step that usually breaks)
        const doc = new DOMParser().parseFromString(gpxString, 'text/xml');
        // C. Convert DOM -> GeoJSON
        const geoJson = toGeoJSON.gpx(doc);

        // --- Standard Validation Logic ---
        const trackFeature = geoJson.features.find(f => f.geometry.type === 'LineString');
        
        if (!trackFeature) {
            // Fallback: Some GPX files use 'MultiLineString'
            const multiTrack = geoJson.features.find(f => f.geometry.type === 'MultiLineString');
            if (multiTrack) {
                // If you want to handle complex tracks, you'd merge them here.
                // For now, we error to keep it simple.
                throw new Error('Complex GPX (MultiLineString) not yet supported.');
            }
            throw new Error('No track found in GPX file.');
        }

        const { geometry, properties} = trackFeature;
        const fileName = name || properties.name || file.name;

        // --- Transactional Save (Same as before) ---
        return await db.transaction(async (trx) => {
            const [track] = await trx('tracks').insert({
                activity_id: activityId,
                name: fileName,
                description: description || null,
            }).returning('*');

            const [polyline] = await trx('polylines').insert({
                track_id: track.id,
                source_type: 'gpx',
                // source_url: sourceUrl,
                geom: db.raw(
                    'ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)', 
                    [JSON.stringify(geometry)]
                )
            }).returning('*');

            const s3Key = s3Service.generateS3Key({
                entityType: 'polylines',
                entityId: polyline.id,
                fileName,
                fileType: 'application/gpx+xml',
            });

            const sourceUrl = await s3Service.uploadFile({
                key: s3Key,
                body: gpxString,
                contentType: 'application/gpx+xml',
            });

            await trx('polylines').where({ id: polyline.id }).update({ source_url: sourceUrl });
            const [updatedTrack] = await trx('tracks').where({ id: track.id }).update({ active_polyline_id: polyline.id }).returning('*');

            return updatedTrack;
        });

    } catch (err) {
        console.error("GPX Parse Error:", err);
        throw new Error(`Failed to process GPX: ${err.message}`);
    } finally {
        if (file) {
            fs.unlinkSync(file.path);
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
};
