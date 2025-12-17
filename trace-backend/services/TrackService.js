const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');
const toGeoJSON = require('@mapbox/togeojson');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const db = require('../config/db');
const { s3Client, BUCKET_NAME, PUBLIC_ENDPOINT } = require('../config/s3');

async function createTrackFromGpx({ file, activityId, name, description }) {
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

module.exports = { createTrackFromGpx };