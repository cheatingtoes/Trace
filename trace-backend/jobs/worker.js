const { Worker } = require('bullmq');
const connection = require('./connection');
const { processRouteFile } = require('../services/RouteService');

console.log('[Worker] Starting Trace Worker...');

const worker = new Worker('ingestion', async (job) => {
  const { activityId, filePath } = job.data;
  
  if (job.name === 'process-route') {
    return await processRouteFile(filePath, activityId);
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed: ${err.message}`);
});