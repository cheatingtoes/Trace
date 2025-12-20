const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const db = require('../config/db');
const exifr = require('exifr');
const sharp = require('sharp');

// 2. MAIN PROCESSOR
// Fix: Changed 's3_key' to 'key' to match the Worker
async function processUploadedMedia({ key, momentId, type }) {
    if (type === 'image') {
        return await processImage(key, momentId);
    } else if (type === 'video') {
        return await processVideo(key, momentId);
    }
}

// --- IMAGE LOGIC ---
async function processImage(key, momentId) {
    console.log(`[MediaService] Downloading: ${key}`);

    try {
        const response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        
        // FIX: Use the native SDK method instead of streamToBuffer
        const byteArray = await response.Body.transformToByteArray();
        const buffer = Buffer.from(byteArray);

        // === DEBUGGING BLOCK ===
        console.log(`[MediaService] File Size: ${buffer.length} bytes`);
        if (buffer.length > 0) {
            console.log(`[MediaService] Hex Header: ${buffer.toString('hex', 0, 16)}`);
        } else {
            throw new Error("File is empty (0 bytes)");
        }
        // =======================

        // B. EXIF & Resize
        const [exifData, thumbnailBuffer] = await Promise.all([
            exifr.parse(buffer, { gps: true, tiff: true }).catch((err) => {
                console.warn(`[MediaService] EXIF failed: ${err.message}`);
                return null;
            }),
            sharp(buffer)
                .resize(300, 300, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer()
        ]);

        // C. Upload Thumbnail
        const thumbKey = key.replace('images/', 'thumbnails/').replace(/\.[^/.]+$/, ".jpg");
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: thumbKey,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg'
        }));

        console.log(`Thumbkey: ${thumbKey}`)

        // D. Update DB
        const updateData = {
            thumbnail_url: `${config.s3.endpoint}/${BUCKET_NAME}/${thumbKey}`,
            occured_at: exifData?.DateTimeOriginal || new Date()
        };

        // PostGIS Geometry Update
        const lat = exifData?.latitude;
        const lon = exifData?.longitude;
        const alt = exifData?.altitude || 0;

        if (lat && lon) {
            // Ensure you use db.raw here (your import is named 'db')
            updateData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [lat, lon, alt]);
        }

        await db('moments')
            .where('id', momentId)
            .update(updateData);
        
        console.log(`[MediaService] Finished Image: ${momentId}`);
        
    } catch (err) {
        console.error(`[MediaService] Fatal Error for ${key}:`, err);
        throw err; // Re-throw so the worker knows it failed
    }
}

// --- VIDEO LOGIC ---
async function processVideo(key, momentId) {
    console.log(`[MediaService] Video processing not yet implemented for ${key}`);
    // Just mark as active so it doesn't get stuck in 'processing' forever
    await db('moments').where('id', momentId).update({ status: 'active' });
}

// --- HELPER (Hoisted) ---
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

// Export EVERYTHING you need
module.exports = {
    processUploadedMedia,
};