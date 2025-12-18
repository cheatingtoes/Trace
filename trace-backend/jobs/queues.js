const { Queue } = require('bullmq');
const connection = require('./connection');

const imageQueue = new Queue('media-image', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }, // Quick retry
    // removeOnComplete: true,
    // removeOnFail: 100
  }
});

const videoQueue = new Queue('media-video', { 
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    // removeOnComplete: true,
    // removeOnFail: 50
  }
});

module.exports = { imageQueue, videoQueue };