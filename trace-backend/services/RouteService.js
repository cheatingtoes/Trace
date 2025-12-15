const fs = require('fs');
// 1. Import the DOMParser (The "Fake Browser")
const { DOMParser } = require('@xmldom/xmldom');
// 2. Import the Converter
const toGeoJSON = require('@mapbox/togeojson');
const db = require('../config/db');

async function createRouteFromGpx(file, userId) {
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

        const { properties, geometry } = trackFeature;

        // --- Transactional Save (Same as before) ---
        return await db.transaction(async (trx) => {
            const [route] = await trx('routes').insert({
                user_id: userId, // Ensure your DB has this column or remove it
                name: properties.name || 'Untitled Activity',
                start_time: properties.time || new Date(),
            }).returning('*');

            await trx('polylines').insert({
                route_id: route.id,
                source_type: 'gpx',
                // PostGIS: Set SRID 4326 + Simplify (0.0001 deg ~ 11 meters)
                geom: db.raw(
                    'ST_SetSRID(ST_Simplify(ST_GeomFromGeoJSON(?), 0.0001), 4326)', 
                    [JSON.stringify(geometry)]
                )
            });

            return route;
        });

    } catch (err) {
        console.error("GPX Parse Error:", err);
        throw new Error(`Failed to process GPX: ${err.message}`);
    }
}

module.exports = { createRouteFromGpx };