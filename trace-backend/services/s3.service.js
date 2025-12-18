const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const { s3Client, BUCKET_NAME, PUBLIC_ENDPOINT } = require('../config/s3');

/**
 * Generates a unique S3 key based on the provided parameters.
 *
 * @param {object} params
 * @param {string} params.entityType - The type of the entity (e.g., 'user', 'post').
 * @param {string|number} params.entityId - The ID of the entity.
 * @param {string} params.fileName - The name of the file to be uploaded.
 * @param {string} params.fileType - The MIME type of the file (e.g., 'image/jpeg').
 * @returns {string} - The generated S3 key.
 */
const generateS3Key = ({ entityType, entityId, fileName, fileType }) => {
    const uuid = crypto.randomUUID();
    let mediaCategory = 'media';
    if (fileType.startsWith('image/')) {
        mediaCategory = 'images';
    } else if (fileType.startsWith('video/')) {
        mediaCategory = 'videos';
    } else if (fileType === 'application/gpx+xml') {
        mediaCategory = 'gpx';
    }
    const safeName = fileName ? fileName.replace(/[^a-zA-Z0-9.-]/g, '_') : 'untitled';
    return `${entityType}/${entityId}/${mediaCategory}/${Date.now()}-${uuid}-${safeName}`;
}

/**
 * Uploads a file directly to S3.
 *
 * @param {object} params
 * @param {string} params.bucket - The S3 bucket name.
 * @param {string} params.key - The S3 object key.
 * @param {ReadableStream|string|Buffer} params.body - The file content.
 * @param {string} params.contentType - The MIME type of the file.
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
async function uploadFile({ key, body, contentType, bucket = BUCKET_NAME }) {
        const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the public URL
    return `${PUBLIC_ENDPOINT}/${bucket}/${key}`;
}

/**
 * Generates a pre-signed URL for uploading a file to S3.
 * This function is generic and can be used for various entities.
 *
 * @param {object} params
 * @param {string|number} params.activityId - The ID of the activity.
 * @param {string} params.fileName - The name of the file to be uploaded.
 * @param {string} params.fileType - The MIME type of the file (e.g., 'image/jpeg').
 * @returns {Promise<{signedUrl: string, key: string}>} - The pre-signed URL and the S3 key.
 */
async function getPresignedUploadUrl({ entityType, entityId, fileName, fileType }) {
    const key = generateS3Key({ entityType, entityId, fileName, fileType });
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return { signedUrl, key };
}

module.exports = {
    generateS3Key,
    getPresignedUploadUrl,
    uploadFile,
};
