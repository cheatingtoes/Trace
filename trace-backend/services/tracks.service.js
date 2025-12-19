const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');
const toGeoJSON = require('@mapbox/togeojson');
const db = require('../config/db');
const s3Service = require('../services/s3.service');
const TrackModel = require('../models/tracks.model');

const getAllTracks = () => {
    return TrackModel.getAllTracks();
};

const getTrackById = (id) => {
    return TrackModel.getTrackById(id);
};

const createTrack = (trackData) => {
    return TrackModel.createTrack(trackData);
};

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
        const fileName = name || properties.name || file.originalname;

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
    getAllTracks,
    getTrackById,
    createTrack,
    uploadTrackFile,
};
