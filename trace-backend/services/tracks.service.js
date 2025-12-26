const { uuidv7 } = require('uuidv7');
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
    const id = uuidv7();
    return TrackModel.createTrack({ id, ...trackData });
};

const deleteTrack = (id) => {
    return TrackModel.deleteTrack(id);
};

async function uploadTrackFile({ file, activityId, name, description }) {
    try {
        // A. Read the file as a simple string
        const gpxString = fs.readFileSync(file.path, 'utf8');
        // B. Parse string -> DOM Node (This is the step that usually breaks)
        const doc = new DOMParser().parseFromString(gpxString, 'text/xml');
        // C. Convert DOM -> GeoJSON
        const geoJson = toGeoJSON.gpx(doc);

        const trackFeature = geoJson.features.find(f => f.geometry.type === 'LineString');
        
        if (!trackFeature) {
            const multiTrack = geoJson.features.find(f => f.geometry.type === 'MultiLineString');
            if (multiTrack) {
                throw new Error('Complex GPX (MultiLineString) not yet supported.');
            }
            throw new Error('No track found in GPX file.');
        }

        const { geometry, properties} = trackFeature;
        const fileName = name || properties.name || file.originalname;

        return await db.transaction(async (trx) => {
            const [track] = await trx('tracks').insert({
                id: uuidv7(),
                activityId,
                name: fileName,
                description: description || null,
            }).returning('*');

            const [polyline] = await trx('polylines').insert({
                id: uuidv7(),
                trackId: track.id,
                sourceType: 'gpx',
                geom: db.raw(
                    'ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)', 
                    [JSON.stringify(geometry)]
                )
            }).returning('*');

            const s3Key = `/polylines/${polyline.id}/gpx/${polyline.id}.gpx`;

            const sourceUrl = await s3Service.uploadFile({
                key: s3Key,
                body: gpxString,
                contentType: 'application/gpx+xml',
            });

            await trx('polylines').where({ id: polyline.id }).update({ sourceUrl: sourceUrl });
            const [updatedTrack] = await trx('tracks').where({ id: track.id }).update({ activePolylineId: polyline.id }).returning('*');

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

const getTracksByActivityId = async (activityId) => {
    return TrackModel.getTracksByActivityId(activityId);
};

module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
    deleteTrack,
    uploadTrackFile,
    getTracksByActivityId
};
