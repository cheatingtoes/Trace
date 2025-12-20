const { Worker } = require('bullmq');
const connection = require('./connection');
const { processUploadedMedia } = require('../services/media.service');

console.log('[Worker] Starting Trace Media Workers...');

// 1. Image Worker (High Concurrency)
const imageWorker = new Worker('media-image', async (job) => {
  // CRITICAL OPTIMIZATION: Extract momentId directly.
  // Don't rely on 'key' to find the DB row; it's slow.
  const { momentId, s3_key } = job.data;

  console.log(`[Image-Worker] Processing Moment #${momentId} (${s3_key})...`);
  await processUploadedMedia({ momentId, key: s3_key, type: 'image' });

}, { connection, concurrency: 10 });


// 2. Video Worker (Low Concurrency)
const videoWorker = new Worker('media-video', async (job) => {
  const { momentId, s3_key } = job.data;

  console.log(`[Video-Worker] Processing Moment #${momentId} (${s3_key})...`);
  await processUploadedMedia({ momentId, key: s3_key, type: 'video' });

}, { connection, concurrency: 1 }); // Strictly 1 video at a time


// --- Lifecycle & Error Handling ---
const workers = [imageWorker, videoWorker];

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