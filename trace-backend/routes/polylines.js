const express = require('express');
const router = express.Router();
const Polyline = require('../models/Polyline');
const Track = require('../models/Track');
const db = require('../config/db');

// GET /api/v1/polylines - Get all polylines
router.get('/', async (req, res) => {
  try {
    const polylines = await Polyline.findAll();
    res.json(polylines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/v1/polylines/:id - Get a single polyline by ID
router.get('/:id', async (req, res) => {
  try {
    const polyline = await Polyline.findByIdAsGeoJSON(req.params.id);
    if (!polyline) {
      return res.status(404).json({ message: 'Polyline not found' });
    }
    res.json(polyline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/polylines - Create a new polyline
router.post('/', async (req, res) => {
  // Example req.body: { track_id: 1, source_url: '...', geojson: { "type": "LineString", "coordinates": [...] } }
  const { track_id, source_url, source_type, geojson } = req.body;

  if (!track_id || !geojson) {
    return res.status(400).json({ message: 'track_id and geojson are required.' });
  }

  try {
    const polylineData = {
      track_id,
      source_url,
      source_type,
      // PostGIS's ST_GeomFromGeoJSON function requires the GeoJSON object as a string.
      geom: db.raw(`ST_GeomFromGeoJSON(?)`, [JSON.stringify(geojson)])
    };
    
    const newPolyline = await Polyline.create(polylineData);
    res.status(201).json(newPolyline);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/polylines/:id - Delete a polyline
router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await Polyline.delete(req.params.id);
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Polyline not found' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
