const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const db = require('../config/db');
const exifr = require('exifr');
const sharp = require('sharp');
const crypto = require('crypto');

// 1. PRESIGNED URL GENERATOR
async function getPresignedUploadUrl(activityId, fileName, fileType) {
    const uuid = crypto.randomUUID();
    // Determine folder: 'images' or 'videos'
    const folder = fileType.startsWith('video/') ? 'videos' : 'images';
    const safeName = fileName ? fileName.replace(/[^a-zA-Z0-9.-]/g, '_') : 'untitled';
    
    const key = `activities/${activityId}/${folder}/${uuid}-${safeName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
    return { signedUrl, key };
}

// 2. MAIN PROCESSOR (Called by Workers)
async function processUploadedMedia(key, activityId, type) {
    if (type === 'image') {
        return await processImage(key, activityId);
    } else if (type === 'video') {
        return await processVideo(key, activityId);
    }
}

// --- IMAGE LOGIC (Fast) ---
async function processImage(key, activityId) {
    console.log(`Downloading image: ${key}`);
    
    // A. Download
    const response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    const buffer = await streamToBuffer(response.Body);

    // B. EXIF & Resize (Parallelize for speed)
    const [exifData, thumbnailBuffer] = await Promise.all([
        exifr.parse(buffer, { gps: true, tiff: true }).catch(() => null), // Fail gracefully
        sharp(buffer).resize(300, 300, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer()
    ]);

    // C. Upload Thumbnail
    const thumbKey = key.replace('images/', 'thumbnails/').replace(/\.[^/.]+$/, ".jpg");
    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg'
    }));

    // D. Update DB
    const updateData = {
        thumbnail_url: `${process.env.S3_ENDPOINT || 'http://localhost:9000'}/${BUCKET_NAME}/${thumbKey}`,
        status: 'ready',
        timestamp: exifData?.DateTimeOriginal || new Date()
    };

    if (exifData?.latitude && exifData?.longitude) {
        updateData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [exifData.longitude, exifData.latitude]);
    }

    // We match purely on 'metadata->>s3_key' because we stored it there in the Confirm step
    await db('moments')
        .whereRaw("metadata->>'s3_key' = ?", [key])
        .update(updateData);
}

// --- VIDEO LOGIC (Slow - Placeholder) ---
async function processVideo(key, activityId) {
    // For now, just mark it as ready without processing
    console.log(`Skipping video transcoding for ${key}`);
    await db('moments')
        .whereRaw("metadata->>'s3_key' = ?", [key])
        .update({ status: 'ready' });
}

// Helper
const streamToBuffer = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
});

module.exports = { getPresignedUploadUrl, processUploadedMedia };