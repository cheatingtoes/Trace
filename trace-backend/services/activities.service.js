const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');
const toGeoJSON = require('@mapbox/togeojson');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const db = require('../config/db');
const { s3Client, BUCKET_NAME, PUBLIC_ENDPOINT } = require('../config/s3');
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

async function getPresignedUploadUrl(activityId, fileName, fileType) {
    const uuid = crypto.randomUUID();
    const safeName = fileName ? fileName.replace(/[^a-zA-Z0-9.-]/g, '_') : 'untitled';
    const key = `activities/${activityId}/images/${Date.now()}-${uuid}-${fileName}`;
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return { signedUrl, key };
}

const signBatch = async (activityId, files) => {
    // Use Promise.all to run all signatures in parallel
    const signedUrls = await Promise.all(files.map(async (file) => {
        // 1. Validate Type
        if (!ALLOWED_MIME_TYPES.includes(file.fileType)) {
            return {
                error: true,
                fileName: file.fileName,
                message: `Unsupported type: ${file.fileType}`
            };
        }

        // 2. Generate Signature
        const { signedUrl, key } = await getPresignedUploadUrl(activityId, file.fileName, file.fileType);

        return {
            originalName: file.fileName, // Send this back so Frontend can match file to URL
            fileType: file.fileType,
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

        const fileName = properties.name || name || `Untitled`;

        const s3Key = `activities/${activityId}/gpx/${Date.now()}-${fileName}.gpx`;
    
        // Use the shared 's3Client'
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME, // Use the shared constant
            Key: s3Key,
            Body: gpxString,
            ContentType: 'application/gpx+xml'
        }));

        const sourceUrl = `${PUBLIC_ENDPOINT}/${BUCKET_NAME}/${s3Key}`;

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
                source_url: sourceUrl,
                geom: db.raw(
                    'ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)', 
                    [JSON.stringify(geometry)]
                )
            }).returning('*');

            await trx('tracks').where({ id: track.id }).update({ active_polyline_id: polyline.id });

            return track;
        });

    } catch (err) {
        console.error("GPX Parse Error:", err);
        throw new Error(`Failed to process GPX: ${err.message}`);
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
