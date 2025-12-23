const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const db = require('../config/db');
const exifr = require('exifr');
const sharp = require('sharp');

async function processUploadedMedia({ key, momentId, type }) {
    if (type === 'image') {
        return await processImage(key, momentId);
    } else if (type === 'video') {
        return await processVideo(key, momentId);
    }
}

async function processImage(key, momentId) {
    console.log(`[MediaService] Downloading: ${key}`);

    try {
        const response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        
        const byteArray = await response.Body.transformToByteArray();
        const buffer = Buffer.from(byteArray);

        if (buffer.length > 0) {
            console.log(`[MediaService] Hex Header: ${buffer.toString('hex', 0, 16)}`);
        } else {
            throw new Error("File is empty (0 bytes)");
        }
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

        const thumbKey = key.replace('images/', 'thumbnails/').replace(/\.[^/.]+$/, ".jpg");
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: thumbKey,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg'
        }));

        const updateData = {
            thumbnailUrl: `${config.s3.endpoint}/${BUCKET_NAME}/${thumbKey}`,
            occuredAt: exifData?.DateTimeOriginal || new Date()
        };

        const lat = exifData?.latitude;
        const lon = exifData?.longitude;
        const alt = exifData?.altitude || 0;

        if (lat && lon) {
            updateData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [lat, lon, alt]);
        }

        await db('moments')
            .where('id', momentId)
            .update(updateData);
        
        console.log(`[MediaService] Finished Image: ${momentId}`);
        
    } catch (err) {
        console.error(`[MediaService] Fatal Error for ${key}:`, err);
        throw err;
    }
}

async function processVideo(key, momentId) {
    console.log(`[MediaService] Video processing not yet implemented for ${key}`);
    // Just mark as active so it doesn't get stuck in 'processing' forever
    await db('moments').where('id', momentId).update({ status: 'active' });
}

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

module.exports = {
    processUploadedMedia,
};