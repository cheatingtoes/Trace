const express = require('express');
const router = express.Router();
const multer = require('multer');

const db = require('../config/db');
const { ALLOWED_MIME_TYPES } = require('../constants/mediaTypes');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { getPresignedUploadUrl } = require('../services/PhotoService');
const { createRouteFromGpx } = require('../services/RouteService');

const upload = multer({ dest: 'uploads/' }); // Temp storage

// GET /api/v1/activities - Get all activities (use with caution in a real app)
router.get('/', async (req, res) => {
  try {
    // This could be paginated. Might not be a useful route without filtering.
    const activities = await db('activities').select('*');
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/v1/activities - Create a new activity
router.post('/', async (req, res) => {
  try {
    const newActivity = await Activity.create(req.body);
    res.status(201).json(newActivity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/v1/activities/:id - Get a single activity by ID
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/v1/activities/:id - Update an activity
router.put('/:id', async (req, res) => {
  try {
    const updatedActivity = await Activity.update(req.params.id, req.body);
    if (!updatedActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(updatedActivity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/v1/activities/:id - Delete an activity
router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await Activity.delete(req.params.id);
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Nested Routes ---

// GET /api/v1/users/:userId/activities - Get all activities for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        // Check if user exists first
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const activities = await Activity.findByUser(req.params.userId);
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/upload-route-file', upload.single('routeFile'), async (req, res) => {
    try {
        // DEBUGGING: Print what Multer found
        console.log('File:', req.file); 
        console.log('Body:', req.body);

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Check field name is "routeFile".' });
        }
        
        const newRoute = await createRouteFromGpx({
          file: req.file,
          activityId: req.params.id,
          name: req.body.name,
          description: req.body.description
        });
        
        // Cleanup temp file
        require('fs').unlinkSync(req.file.path);
        
        res.json(newRoute);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/v1/activities/:id/photos/sign-batch
router.post('/:id/photos/sign-batch', async (req, res) => {
    const activityId = req.params.id;
    const { files } = req.body; // Expecting array of { fileName, fileType }

    if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
    }

    // Limit batch size if needed (e.g., max 50 at a time)
    // if (files.length > 50) {
    //     return res.status(400).json({ error: 'Batch limit exceeded. Please sign 50 files at a time.' });
    // }

    try {
        // Use Promise.all to run all signatures in parallel
        const signedUrls = await Promise.all(files.map(async (file) => {
            // 1. Validate Type
            if (!ALLOWED_MIME_TYPES.includes(file.fileType)) {
                return { 
                    error: true, 
                    fileName: file.fileName, 
                    message: `Unsupported type: ${file.fileType}` 
                };
            }

            // 2. Generate Signature
            const { signedUrl, key } = await getPresignedUploadUrl(activityId, file.fileName, file.fileType);
            
            return {
                originalName: file.fileName, // Send this back so Frontend can match file to URL
                fileType: file.fileType,
                signedUrl,
                key
            };
        }));

        res.json(signedUrls);

    } catch (err) {
        console.error("Batch Signing Error:", err);
        res.status(500).json({ error: 'Failed to generate signatures' });
    }
});


module.exports = router;
