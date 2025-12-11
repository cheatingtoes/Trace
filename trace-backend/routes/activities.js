const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ingestionQueue } = require('../jobs/queues'); // Import the queue
const Activity = require('../models/Activity');
const User = require('../models/User'); // For checking if user exists

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

router.post('/:id/upload-gpx', upload.single('file'), async (req, res) => {
  const activityId = req.params.id;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Add job to background queue
  await ingestionQueue.add('process-route', {
    activityId,
    filePath: req.file.path
  });

  // Respond immediately
  res.json({ 
    message: 'File received. Processing started.', 
    jobId: 'queued' // In a real app you might return job.id
  });
});


module.exports = router;
