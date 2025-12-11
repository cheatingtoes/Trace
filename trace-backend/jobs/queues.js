const { Queue } = require('bullmq');
const connection = require('./connection');

// The 'ingestion' queue will handle heavy file processing
const ingestionQueue = new Queue('ingestion', { connection });

module.exports = { ingestionQueue };