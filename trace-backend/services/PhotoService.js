const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const exifr = require('exifr');
const db = require('../config/db');
const { s3Client, BUCKET_NAME } = require('../config/s3');

/**
 * Uploads a file stream to S3/MinIO
 * @param {Object} file - Multer file object
 * @param {string} activityId - ID of the activity (folder structure)
 */
async function uploadPhoto(file, activityId) {
    const fileStream = fs.createReadStream(file.path);
    const key = `activities/${activityId}/${Date.now()}-${file.originalname}`;

    const upload = new Upload({
        client: s3,
        params: {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileStream,
            ContentType: file.mimetype,
        },
    });

    await upload.done();
    
    // Construct public URL
    // Note: In production, this would be your Cloudfront/CDN URL.
    // Locally, it's the minio address.
    const url = `${process.env.S3_ENDPOINT || 'http://localhost:9000'}/${BUCKET_NAME}/${key}`;
    
    return {
        key,
        url,
        originalName: file.originalname
    };
}

/**
 * 1. Generates a URL that allows the frontend to upload directly
 */
async function getPresignedUploadUrl(activityId, fileName, fileType) {
    const key = `activities/${activityId}/images/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        // ACL: 'public-read' // Uncomment if you want files public immediately
    });

    // URL expires in 60 seconds
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    
    return { signedUrl, key };
}
/**
 * 2. Worker Method: Downloads from S3 to parse EXIF
 * (Note: We use a buffer here. For massive files, we'd stream to a temp file)
 */
async function processUploadedPhoto(key, activityId) {
    console.log(`[Worker] Processing S3 Object: ${key}`);

    // Fetch the file BACK from S3 to process it
    // (This seems redundant but is necessary because the backend never saw the file)
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });
    
    const response = await s3.send(command);
    
    // Convert stream to buffer for exifr
    const streamToBuffer = (stream) => new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });

    const fileBuffer = await streamToBuffer(response.Body);

    // Parse EXIF
    let gpsData = null;
    let takenAt = new Date();
    
    try {
        const exif = await exifr.parse(fileBuffer, { gps: true, tiff: true });
        if (exif) {
             if (exif.latitude && exif.longitude) {
                // GeoJSON/PostGIS format
                gpsData = db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [exif.longitude, exif.latitude]);
            }
            takenAt = exif.DateTimeOriginal || exif.CreateDate || new Date();
        }
    } catch (e) {
        console.warn(`[Worker] EXIF extraction failed for ${key}: ${e.message}`);
    }

    // Insert into DB
    // Construct the public URL (Manual construction for MinIO/S3)
    const publicUrl = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;

    await db('moments').insert({
        activity_id: activityId,
        url: publicUrl,
        type: 'photo',
        geom: gpsData,
        taken_at: takenAt
    });

    return { success: true };
}
module.exports = { uploadPhoto, getPresignedUploadUrl, processUploadedPhoto };