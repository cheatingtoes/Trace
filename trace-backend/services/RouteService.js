const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const db = require('../config/db'); // Your existing Knex config

// Secure Parser Configuration
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

// Helper to extract [lon, lat] from the parsed XML object
function extractCoordinates(trackSegments) {
  let coords = [];
  // Handle case where gpx has 1 segment vs array of segments
  const segments = Array.isArray(trackSegments) ? trackSegments : [trackSegments];

  for (const segment of segments) {
    if (!segment.trkpt) continue;
    const points = Array.isArray(segment.trkpt) ? segment.trkpt : [segment.trkpt];
    
    for (const point of points) {
      if (point["@_lon"] && point["@_lat"]) {
        coords.push([
          parseFloat(point["@_lon"]),
          parseFloat(point["@_lat"])
        ]);
      }
    }
  }
  return coords;
}

async function processRouteFile(filePath, activityId) {
  try {
    console.log(`[RouteService] Reading file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // 1. Parse XML securely
    const gpxtObj = parser.parse(fileContent);
    
    // Drill down into GPX structure ( <gpx> -> <trk> -> <trkseg> )
    // Note: You might need extra checks here if file is KML vs GPX
    const track = gpxtObj.gpx?.trk;
    
    if (!track || !track.trkseg) {
      throw new Error("Invalid GPX: No track segments found.");
    }

    const coordinates = extractCoordinates(track.trkseg);
    console.log(`[RouteService] Extracted ${coordinates.length} points.`);

    if (coordinates.length === 0) throw new Error("No points found.");

    // 2. Format as GeoJSON LineString
    const geometry = {
      type: 'LineString',
      coordinates: coordinates
    };

    // 3. Save Raw Geometry to DB
    await db('polylines').insert({
      activity_id: activityId,
      geom: db.raw('ST_GeomFromGeoJSON(?)', [JSON.stringify(geometry)])
    });

    // 4. Simplify in DB (The "Magic" PostGIS step)
    // 0.0001 is roughly 10 meters tolerance
    await db.raw(`
      UPDATE polylines 
      SET geom = ST_Simplify(geom, 0.0001) 
      WHERE activity_id = ?
    `, [activityId]);

    console.log(`[RouteService] Success for Activity ${activityId}`);
    return { success: true, pointCount: coordinates.length };

  } catch (err) {
    console.error(`[RouteService] Error:`, err.message);
    throw err; // Re-throw so the worker knows it failed
  }
}

module.exports = { processRouteFile };