const { GetObjectCommand } = require('@aws-sdk/client-s3');
const sax = require('sax');
const { uuidv7 } = require('uuidv7');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const db = require('../config/db');

const BATCH_SIZE = 50000;

/**
 * Streams a GPX file from S3, parses it, and creates a polyline entry using a temporary table.
 * This approach avoids OOM errors for large files (e.g., 500MB) by offloading geometry construction to PostGIS.
 * 
 * @param {Object} params
 * @param {string} params.s3Key - The S3 key of the GPX file.
 * @param {string} params.trackId - The ID of the track to associate with.
 */
async function processGpxStream({ s3Key, trackId }) {
    console.log(`[GPX-Stream] Starting for Track ${trackId}...`);

    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key });
    const s3Item = await s3Client.send(command);
    const fileStream = s3Item.Body;

    // 1. Parse Stream & Accumulate Points in Memory
    // This avoids DB overhead for row-by-row inserts and massive aggregations.
    const coordinates = await parseGpxToCoordinates(fileStream);

    if (coordinates.length === 0) {
        throw new Error('No valid track points found in GPX file.');
    }

    // Extract polylineId from s3Key
    const polylineIdMatch = s3Key.match(/polylines\/([^/]+)\.gpx$/);
    let polylineId;
    if (polylineIdMatch && polylineIdMatch[1]) {
        polylineId = polylineIdMatch[1];
    } else {
         console.warn(`[GPX-Stream] Could not extract polylineId from key: ${s3Key}.`);
         throw new Error(`Invalid S3 Key format: ${s3Key}`);
    }

    // 2. Construct GeoJSON
    const geoJsonGeometry = {
        type: 'LineString',
        coordinates: coordinates // [[lon, lat, ele], ...]
    };

    // 3. Update Database in a Single Query
    await db.transaction(async (trx) => {
        await trx('polylines')
            .where({ id: polylineId })
            .update({
                geom: db.raw('ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)', [JSON.stringify(geoJsonGeometry)]),
                // We skip server-side simplification (simplified_geom) to avoid DB OOM.
                // It can be generated lazily or by a more powerful worker if needed.
                storage_key: s3Key
            });

        await trx('tracks')
            .where({ id: trackId })
            .update({ 
                activePolylineId: polylineId,
                status: 'active' 
            });
    });

    console.log(`[GPX-Stream] Successfully updated polyline ${polylineId} and activated track ${trackId} with ${coordinates.length} points.`);
}

/**
 * Parses stream and returns array of [lon, lat, ele] coordinates
 */
function parseGpxToCoordinates(inputStream) {
    return new Promise((resolve, reject) => {
        const parser = sax.createStream(true, { trim: true });
        
        let coordinates = [];
        let currentPoint = null;
        let lastSavedPoint = null;
        let currentTag = null;
        const MIN_DISTANCE_METERS = 2;

        parser.on('opentag', (node) => {
            if (node.name === 'trkpt') {
                currentPoint = {
                    lat: parseFloat(node.attributes.lat),
                    lon: parseFloat(node.attributes.lon),
                    ele: 0
                };
            } else if (currentPoint && (node.name === 'ele')) {
                currentTag = node.name;
            }
        });

        parser.on('text', (text) => {
            if (currentPoint && currentTag === 'ele') {
                currentPoint.ele = parseFloat(text);
            }
        });

        parser.on('closetag', (tagName) => {
            currentTag = null;
            if (tagName === 'trkpt' && currentPoint) {
                // Filter points
                let shouldSave = true;
                if (lastSavedPoint) {
                    const dist = haversineDistance(lastSavedPoint, currentPoint);
                    if (dist < MIN_DISTANCE_METERS) {
                        shouldSave = false;
                    }
                }

                if (shouldSave) {
                    // GeoJSON format: [lon, lat, ele]
                    coordinates.push([currentPoint.lon, currentPoint.lat, currentPoint.ele]);
                    lastSavedPoint = currentPoint;
                }
                currentPoint = null;
            }
        });

        parser.on('end', () => {
            resolve(coordinates);
        });

        parser.on('error', (err) => reject(err));

        inputStream.pipe(parser);
    });
}

/**
 * Calculates the Haversine distance between two points in meters.
 * @param {Object} p1 - { lat, lon }
 * @param {Object} p2 - { lat, lon }
 * @returns {number} Distance in meters
 */
function haversineDistance(p1, p2) {
    const R = 6371e3; // Earth radius in meters
    const toRad = x => x * Math.PI / 180;

    const dLat = toRad(p2.lat - p1.lat);
    const dLon = toRad(p2.lon - p1.lon);
    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

module.exports = { processGpxStream };