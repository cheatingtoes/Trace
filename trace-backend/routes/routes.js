const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Activity = require('../models/Activity'); // For checking if activity exists

// GET /api/v1/routes - Get all routes
router.get('/', async (req, res) => {
  try {
    const routes = await db('routes').select('*');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/routes - Create a new route
router.post('/', async (req, res) => {
  try {
    const newRoute = await Route.create(req.body);
    res.status(201).json(newRoute);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/v1/routes/:id - Get a single route by ID
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/v1/routes/:id - Update a route
router.put('/:id', async (req, res) => {
  try {
    const updatedRoute = await Route.update(req.params.id, req.body);
    if (!updatedRoute) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(updatedRoute);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/routes/:id - Delete a route
router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await Route.delete(req.params.id);
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- Nested Routes ---

// GET /api/v1/activities/:activityId/routes - Get all routes for a specific activity
router.get('/activity/:activityId', async (req, res) => {
    try {
        // Check if activity exists first
        const activity = await Activity.findById(req.params.activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        const routes = await Route.findByActivity(req.params.activityId);
        res.json(routes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
