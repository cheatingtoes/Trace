const { uuidv7 } = require('uuidv7');
const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');
const toGeoJSON = require('@mapbox/togeojson');
const db = require('../config/db');
const s3Service = require('../services/s3.service');
const TrackModel = require('../models/tracks.model');
const { BadRequestError } = require('../errors/customErrors');
const { isGpx, MAX_GPX_SIZE_BYTES } = require('../constants/mediaTypes');
const { gpxQueue } = require('../jobs/queues');


const getAllTracks = () => {
    return TrackModel.getAllTracks();
};

const getTrackById = (id) => {
    return TrackModel.getTrackById(id);
};

const createTrack = (trackData) => {
    const id = uuidv7();
    return TrackModel.createTrack({ id, ...trackData });
};

const deleteTrack = (id) => {
    return TrackModel.deleteTrack(id);
};

const updateTrack = async (id, updates) => {
    const [updatedTrack] = await TrackModel.updateTrack(id, updates);
    if (!updatedTrack) {
        throw new NotFoundError(`Track with ID ${id} not found.`);
    }
    const fullTrack = await TrackModel.getTrackWithPolyline(id);
    return {
        ...fullTrack,
        polyline: fullTrack.polyline ? JSON.parse(fullTrack.polyline) : null
    };
};

const deleteTracksByActivityId = async (activityId) => {
    return TrackModel.deleteTracksByActivityId(activityId);
}

async function uploadTrackFile({ file, activityId, name, description, userId }) {
    try {
        if (!file) {
            throw new BadRequestError('No file uploaded. Check field name is "file".');
        }
        if (!isGpx(file.mimetype, file.originalname)) {
            throw new BadRequestError('File not valid. Please upload a gpx file.');
        }
        if (file.size > MAX_GPX_SIZE_BYTES) {
            throw new BadRequestError(`File is too large. Maximum size is ${MAX_GPX_SIZE_BYTES / 1024 / 1024} MB.`);
        }
        // A. Read the file as a simple string
        const gpxString = fs.readFileSync(file.path, 'utf8');
        // B. Parse string -> DOM Node (This is the step that usually breaks)
        const doc = new DOMParser().parseFromString(gpxString, 'text/xml');
        // C. Convert DOM -> GeoJSON
        const geoJson = toGeoJSON.gpx(doc);

        const trackFeature = geoJson.features.find(f => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString');
        
        if (!trackFeature) {
            throw new Error('No track found in GPX file.');
        }

        const { geometry, properties} = trackFeature;
        const fileName = name || properties.name || file.originalname;

        const updatedTrack = await db.transaction(async (trx) => {
            const [track] = await trx('tracks').insert({
                id: uuidv7(),
                activityId,
                name: fileName,
                description: description || null,
            }).returning('*');

            const [polyline] = await trx('polylines').insert({
                id: uuidv7(),
                trackId: track.id,
                mimeType: 'application/gpx+xml',
                fileSizeBytes: file.size,
                geom: db.raw(
                    'ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON(?)), 4326)', 
                    [JSON.stringify(geometry)]
                )
            }).returning('*');

            const key = `${userId}/activities/${activityId}/polylines/${polyline.id}.gpx`

            await s3Service.uploadFile({
                key: key,
                body: gpxString,
                contentType: 'application/gpx+xml',
            });

            await trx('polylines').where({ id: polyline.id }).update({ storageKey: key });
            await trx('tracks').where({ id: track.id }).update({ activePolylineId: polyline.id });

            // Return the ID so we can fetch the full object outside the transaction (or inside if model supports trx)
            return track.id;
        });

        // Fetch the full track with polyline structure
        const fullTrack = await TrackModel.getTrackWithPolyline(updatedTrack);
        
        return {
            ...fullTrack,
            polyline: fullTrack.polyline ? JSON.parse(fullTrack.polyline) : null
        };

    } catch (err) {
        console.error("GPX Parse Error:", err);
        throw new Error(`Failed to process GPX: ${err.message}`);
    } finally {
        if (file) {
            fs.unlinkSync(file.path);
        }
    }
}

const getTracksByActivityId = async (activityId) => {
    const tracks = await TrackModel.getTracksByActivityId(activityId);
    return tracks.map(track => ({
        ...track,
        polyline: track.polyline ? JSON.parse(track.polyline) : null
    }));
};

const getTracksByActivityIds = async (activityIds) => {
    const tracks = await TrackModel.getTracksByActivityIds(activityIds);
    return tracks.map(track => ({
        ...track,
        polyline: track.polyline ? JSON.parse(track.polyline) : null
    }));
};

const getTrackUploadUrl = async (userId, activityId, file) => {
    if (!userId || !activityId || !file) {
        throw new BadRequestError('Missing required fields');
    }
    const mimeType = 'application/gpx+xml'; // Standardize on this
    // Simple validation, though the real check is on the file content later
    if (!file.originalname.toLowerCase().endsWith('.gpx')) {
         throw new BadRequestError('File not valid. Please upload a gpx file.');
    }
    // Note: file.size might not be available if this is just a request for a URL before upload
    // If 'file' here is just metadata (name, type, size) from the frontend:
    const fileSize = file.size || 0; 

    if (fileSize > MAX_GPX_SIZE_BYTES) {
        throw new BadRequestError(`File is too large. Maximum size is ${MAX_GPX_SIZE_BYTES / 1024 / 1024} MB.`);
    }

    // Check for duplicates
    const duplicate = await TrackModel.findDuplicateTrack({
        activityId,
        name: file.originalname,
        fileSizeBytes: fileSize
    });

    if (duplicate) {
        return {
            status: 'duplicate',
            trackId: duplicate.id,
            message: 'File already exists for this activity.'
        };
    }

    const { signedUrl, key, trackId, polylineId } = await db.transaction(async (trx) => {
        const [track] = await trx('tracks').insert({
            id: uuidv7(),
            activityId,
            status: 'pending',
            name: file.originalname || 'Untitled Track',
        }).returning('*');

        const [polyline] = await trx('polylines').insert({
            id: uuidv7(),
            trackId: track.id,
            mimeType: mimeType,
            fileSizeBytes: fileSize,
            // storageKey will be updated after upload confirmation
        }).returning('*');

        const key = `${userId}/activities/${activityId}/polylines/${polyline.id}.gpx`;
        const signedUrl = await s3Service.getPresignedUploadUrl(key, mimeType);
        await trx('tracks').where({ id: track.id }).update({ activePolylineId: polyline.id });

        return { signedUrl, key, trackId: track.id, polylineId: polyline.id };
    });
    
    return { signedUrl, key, trackId, polylineId };
};

const confirmUpload = async (trackId, polylineId, key) => {
    if (!trackId || !polylineId || !key) {
        throw new BadRequestError('Missing required fields');
    }
    gpxQueue.add('process-gpx', {
        trackId,
        polylineId,
        storageKey: key
    });
    
    return TrackModel.updateStatus(trackId, 'processing');
};

const getTracksByStatus = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const tracks = await TrackModel.getTracksByIds(ids);
    return tracks.map(track => ({
        ...track,
        polyline: track.polyline ? JSON.parse(track.polyline) : null
    }));
};

module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
    updateTrack,
    deleteTrack,
    deleteTracksByActivityId,
    uploadTrackFile,
    getTracksByActivityId,
    getTracksByActivityIds,
    getTrackUploadUrl,
    confirmUpload,
    getTracksByStatus
};
