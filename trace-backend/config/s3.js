const { S3Client } = require('@aws-sdk/client-s3');
const config = require('../config');


const s3Client = new S3Client({
    region: config.s3.region,
    endpoint: config.s3.endpoint,
    credentials: config.s3.credentials,
    forcePathStyle: config.s3.forcePathStyle, // Required for MinIO
});

const BUCKET_NAME = config.s3.bucketName;
const PUBLIC_ENDPOINT = config.s3.publicEndpoint;

module.exports = { s3Client, BUCKET_NAME, PUBLIC_ENDPOINT };