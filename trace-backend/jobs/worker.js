const { Worker } = require('bullmq');
const connection = require('./connection');
const { processUploadedMedia } = require('../services/media.service');
const { processGpxStream } = require('../services/gpx.processor');

console.log('[Worker] Starting Trace Media Workers...');

// 1. Image Worker (High Concurrency)
const imageWorker = new Worker('media-image', async (job) => {
  // CRITICAL OPTIMIZATION: Extract momentId directly.
  // Don't rely on 'key' to find the DB row; it's slow.
  const { momentId, storageKey, activityId } = job.data;

  console.log(`[Image-Worker] Processing Moment: ${momentId}, Storage Key: (${storageKey}), for Activity: ${activityId}...`);
  await processUploadedMedia({ momentId, activityId, key: storageKey, type: 'image' });

}, { connection, concurrency: 10 });


// 2. Video Worker (Low Concurrency)
const videoWorker = new Worker('media-video', async (job) => {
  const { momentId, storageKey } = job.data;

  console.log(`[Video-Worker] Processing Moment #${momentId} (${storageKey}) for Activity #${activityId}...`);
  await processUploadedMedia({ momentId, key: storageKey, type: 'video', activityId });

}, { connection, concurrency: 1 }); // Strictly 1 video at a time

// 3. GPX Worker (Single Concurrency to save DB CPU)
const gpxWorker = new Worker('media-gpx', async (job) => {
  const { trackId, storageKey } = job.data;
  
  console.log(`[GPX-Worker] Processing Track #${trackId}...`);
  
  // Update status to 'processing'
  // await updateTrackStatus(trackId, 'processing'); 

  await processGpxStream({ storageKey, trackId });

  // Update status to 'ready'
  // await updateTrackStatus(trackId, 'ready');

}, { connection, concurrency: 1 });

// --- Lifecycle & Error Handling ---
const workers = [imageWorker, videoWorker, gpxWorker];

workers.forEach(worker => {
  worker.on('completed', (job) => console.log(`[${worker.name}] Job ${job.id} finished.`));
  worker.on('failed', (job, err) => console.error(`[${worker.name}] Job ${job.id} failed: ${err.message}`));
});

// Graceful Shutdown (Prevents corrupting files during deploy)
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing workers...');
  await Promise.all(workers.map(w => w.close()));
  await connection.quit();
  process.exit(0);
});