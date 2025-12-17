const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Activity = require('../models/Activity');
const { createRouteFromGpx } = require('../services/RouteService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Configure Multer Disk Storage for temporary file saving
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'tmp_uploads'));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  // Optional: Limit file size and number of files
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 1,
  },
});

// POST /api/v1/routes/:id/upload-gpx - Upload a GPX file for a specific route
router.post('/:id/upload-gpx', upload.single('routeFile'), async (req, res) => {
    const routeId = req.params.id;
    const file = req.file;

    // A. Input Validation
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    if (!routeId) {
         // This should ideally be handled by the outer router middleware, but is a good safeguard
        return res.status(400).json({ message: 'Route ID is required.' });
    }

    try {
        // B. Check if Route exists (Good practice before processing)
        const route = await Route.findById(routeId);
        if (!route) {
            // Clean up the uploaded file if the route doesn't exist
            fs.unlinkSync(file.path);
            return res.status(404).json({ message: 'Route not found' });
        }

        // C. Process the file using your new service
        const result = await createRouteFromGpx(file.path, routeId);

        // D. Optional: Delete the temporary file after successful processing
        // Note: createRouteFromGpx currently uses the path as sourceUrl, 
        // so if you plan to keep the file, this cleanup must be skipped. 
        // For a true "upload-then-process" flow, keeping it locally is rarely desired.
        // Assuming your service handles file persistence (e.g., to S3 or permanent storage) 
        // or that the sourceUrl is a temporary path, we delete it.
        fs.unlinkSync(file.path);

        res.json({ 
            message: 'GPX file processed and route updated successfully',
            routeId: routeId,
            pointCount: result.pointCount,
            polylineId: result.polylineId
        });

    } catch (err) {
        console.error(`[Routes] Upload Error:`, err);
        // Ensure temporary file is deleted even on processing failure
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        res.status(500).json({ 
            message: 'Error processing file',
            error: err.message 
        });
    }
});

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

/*

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

*/

module.exports = router;
