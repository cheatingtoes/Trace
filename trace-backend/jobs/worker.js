const { Worker } = require('bullmq');
const connection = require('./connection');
const { processUploadedMedia } = require('../services/media.service'); // Ensure you renamed this file!

console.log('[Worker] Starting Trace Media Workers...');

const imageWorker = new Worker('media-image', async (job) => {
  const { activityId, key } = job.data;
  console.log(`[Image-Worker] Processing ${key}...`);
  
  // We pass a 'type' flag so the service knows what to do, 
  // or the service can infer it from the extension.
  await processUploadedMedia(key, activityId, 'image');
  
}, { connection, concurrency: 5 }); // Run 5 photos in parallel


const videoWorker = new Worker('media-video', async (job) => {
  const { activityId, key } = job.data;
  console.log(`[Video-Worker] Processing ${key}...`);
  
  await processUploadedMedia(key, activityId, 'video');

}, { connection, concurrency: 1 }); // Run 1 video at a time


// --- Event Listeners ---
const workers = [imageWorker, videoWorker];
workers.forEach(worker => {
  worker.on('completed', (job) => console.log(`[${worker.name}] Job ${job.id} done.`));
  worker.on('failed', (job, err) => console.error(`[${worker.name}] Job ${job.id} failed: ${err.message}`));
});