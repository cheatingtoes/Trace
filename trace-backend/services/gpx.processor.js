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
 * @param {string} params.key - The S3 key of the GPX file.
 * @param {string} params.trackId - The ID of the track to associate with.
 */
async function processGpxStream({ storageKey, trackId }) {
    console.log(`[GPX-Stream] Starting for Track ${trackId}...`);

    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: storageKey });
    const s3Item = await s3Client.send(command);
    const fileStream = s3Item.Body;

    // 1. Parse Stream -> Returns Array of Arrays (MultiLineString)
    const segmentCoordinates = await parseGpxToCoordinates(fileStream);

    // Basic Validation
    if (segmentCoordinates.length === 0 || segmentCoordinates[0].length === 0) {
        throw new Error('No valid track points found in GPX file.');
    }

    const polylineIdMatch = storageKey.match(/polylines\/([^/]+)\.gpx$/);
    let polylineId;
    if (polylineIdMatch && polylineIdMatch[1]) {
        polylineId = polylineIdMatch[1];
    } else {
         throw new Error(`Invalid S3 Key format: ${storageKey}`);
    }

    // 2. Construct GeoJSON as MultiLineString
    // Structure: { type: "MultiLineString", coordinates: [ [[x,y], [x,y]], [[x,y], [x,y]] ] }
    const geoJsonGeometry = {
        type: 'MultiLineString',
        coordinates: segmentCoordinates
    };

    const geoJsonString = JSON.stringify(geoJsonGeometry);
    const TOLERANCE = 0.0001;

    // 3. Update Database
    // NOTE: Ensure your DB column `geom` is type `geometry(MultiLineString, 4326)` 
    // or generic `geometry(Geometry, 4326)`.
    await db.transaction(async (trx) => {
        await trx('polylines')
            .where({ id: polylineId })
            .update({
                geom: db.raw('ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)', [geoJsonString]),
                simplified_geom: db.raw(
                    'ST_Simplify(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326), ?)', 
                    [geoJsonString, TOLERANCE]
                ),
                storage_key: storageKey
            });

        await trx('tracks')
            .where({ id: trackId })
            .update({ 
                activePolylineId: polylineId,
                status: 'active' 
            });
    });

    const totalPoints = segmentCoordinates.reduce((acc, seg) => acc + seg.length, 0);
    console.log(`[GPX-Stream] Updated polyline ${polylineId} (MultiLineString) with ${segmentCoordinates.length} segments and ${totalPoints} total points.`);
}

/**
 * Parses stream and returns array of arrays of [lon, lat, ele] coordinates
 * Returns: [ [ [lon, lat, ele], ... ], [ [lon, lat, ele], ... ] ]
 */
function parseGpxToCoordinates(inputStream) {
    return new Promise((resolve, reject) => {
        const parser = sax.createStream(true, { trim: true });
        
        // Master list containing segments
        let multiLineCoordinates = []; 
        
        // The current segment being built
        let currentSegment = [];
        
        let currentPoint = null;
        let lastSavedPoint = null;
        let currentTag = null;
        const MIN_DISTANCE_METERS = 2;

        parser.on('opentag', (node) => {
            if (node.name === 'trkseg') {
                // START OF SEGMENT: Reset the current list and filter state
                currentSegment = [];
                lastSavedPoint = null;
            } else if (node.name === 'trkpt') {
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
                // Filter points logic (unchanged, just applied to currentSegment)
                let shouldSave = true;
                if (lastSavedPoint) {
                    const dist = haversineDistance(lastSavedPoint, currentPoint);
                    if (dist < MIN_DISTANCE_METERS) {
                        shouldSave = false;
                    }
                }

                if (shouldSave) {
                    // Push to CURRENT SEGMENT, not the master list yet
                    currentSegment.push([currentPoint.lon, currentPoint.lat, currentPoint.ele]);
                    lastSavedPoint = currentPoint;
                }
                currentPoint = null;
            } 
            else if (tagName === 'trkseg') {
                // END OF SEGMENT: "Commit" this segment to the master list
                if (currentSegment.length > 0) {
                    multiLineCoordinates.push(currentSegment);
                }
            }
        });

        parser.on('end', () => {
            // Fallback: If the GPX didn't use <trkseg> tags (rare but possible), 
            // check if we have leftover points in currentSegment and save them.
            if (currentSegment.length > 0 && multiLineCoordinates.length === 0) {
                 multiLineCoordinates.push(currentSegment);
            } else if (currentSegment.length > 0) {
                 // If strict XML structure was followed, this shouldn't happen, 
                 // but good for robustness.
                 multiLineCoordinates.push(currentSegment);
            }
            
            resolve(multiLineCoordinates);
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