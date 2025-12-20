const { Queue } = require('bullmq');
const connection = require('./connection');

// 1. Image Queue (High Priority, Fast)
const imageQueue = new Queue('media-image', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true, // Auto-cleanup
    removeOnFail: 500       // Keep last 500 failed jobs for debugging
  }
});

// 2. Video Queue (Low Priority, Slow)
const videoQueue = new Queue('media-video', { 
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: 100
  }
});

module.exports = { imageQueue, videoQueue };