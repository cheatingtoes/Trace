const express = require('express');
const router = express.Router();
const Polyline = require('../models/Polyline');
const Route = require('../models/Route'); // For checking if route exists
const db = require('../config/db'); // For PostGIS functions

// POST /api/v1/polylines - Create a new polyline
router.post('/', async (req, res) => {
  // Example req.body: { route_id: 1, source_url: '...', wkt: 'LINESTRING( ... )' }
  const { route_id, source_url, source_type, wkt } = req.body;

  if (!route_id || !wkt) {
    return res.status(400).json({ message: 'route_id and wkt (Well-Known Text) are required.' });
  }

  try {
    const polylineData = {
      route_id,
      source_url,
      source_type,
      geom: db.raw(`ST_GeomFromText(?, 4326)`, [wkt]) // Use Knex.raw for PostGIS function
    };
    
    const newPolyline = await Polyline.create(polylineData);
    res.status(201).json(newPolyline);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/v1/polylines/:id - Get a single polyline by ID
router.get('/:id', async (req, res) => {
  try {
    const polyline = await Polyline.findById(req.params.id);
    if (!polyline) {
      return res.status(404).json({ message: 'Polyline not found' });
    }
    res.json(polyline);
  } catch (err) {
    res.status(500).json({ message: err.message });
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


// --- Nested Routes ---

// GET /api/v1/routes/:routeId/polylines - Get all polylines for a specific route
router.get('/route/:routeId', async (req, res) => {
    try {
        // Check if route exists first
        const route = await Route.findById(req.params.routeId);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        const polylines = await Polyline.findByRoute(req.params.routeId);
        res.json(polylines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
