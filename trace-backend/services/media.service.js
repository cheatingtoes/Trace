const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const db = require('../config/db');
const exifr = require('exifr');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { pipeline } = require('stream/promises');

ffmpeg.setFfmpegPath(ffmpegPath);

async function processUploadedMedia({ key, momentId, type }) {
    if (type === 'image') {
        return await processImage(key, momentId);
    } else if (type === 'video') {
        return await processVideo(key, momentId);
    }
}

async function processImage(key, momentId) {
    console.log(`[MediaService] Downloading: ${key} for moment: ${momentId}`);

    try {
        const response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        
        const byteArray = await response.Body.transformToByteArray();
        const buffer = Buffer.from(byteArray);

        if (buffer.length > 0) {
            console.log(`[MediaService] Hex Header: ${buffer.toString('hex', 0, 16)}`);
        } else {
            throw new Error("File is empty (0 bytes)");
        }
        const [exifData, thumbnailBuffer, webBuffer] = await Promise.all([
            exifr.parse(buffer, { gps: true, tiff: true }).catch((err) => {
                console.warn(`[MediaService] EXIF failed: ${err.message}`);
                return null;
            }),
            sharp(buffer)
                .resize(300, 300, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer(),
            sharp(buffer)
                .rotate()
                .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
                .toFormat('webp', { quality: 85 })
                .toBuffer()
        ]);

        const thumbKey = key.replace('images/', 'thumbnails/').replace(/\.[^/.]+$/, ".jpg");
        const webKey = key.replace('images/', 'web/').replace(/\.[^/.]+$/, ".webp");
        await Promise.all([
            uploadToS3(thumbKey, thumbnailBuffer, 'image/jpeg'),
            uploadToS3(webKey, webBuffer, 'image/webp')
        ]);

        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: thumbKey,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg'
        }));

        const updateData = {
            storageKey: key,
            storageThumbKey: thumbKey,
            storageWebKey: webKey,
            mimeType: 'image/jpeg',
            occuredAt: exifData?.DateTimeOriginal || new Date(),
            status: 'active'
        };

        const lat = exifData?.latitude;
        const lon = exifData?.longitude;
        const alt = exifData?.altitude || 0;

        if (lat && lon) {
            updateData.geom = db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [lon, lat, alt]);
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
    console.log(`[MediaService] Processing Video: ${key}`);
    const tempVideoPath = path.join(os.tmpdir(), `video-${momentId}-${Date.now()}.mp4`);
    const tempOptimizedPath = path.join(os.tmpdir(), `optimized-${momentId}-${Date.now()}.mp4`);
    const tempThumbPath = path.join(os.tmpdir(), `thumb-${momentId}.jpg`);

    try {
        // 1. Download Video to Disk (Streams are safer for video than Buffers)
        const response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        await pipeline(response.Body, fs.createWriteStream(tempVideoPath));

        // 2. Extract Metadata & Thumbnail using FFmpeg
        const metadata = await getVideoMetadata(tempVideoPath);
        await generateVideoThumbnail(tempVideoPath, tempThumbPath);

        // 3. Transcode Video for Web
        console.log(`[MediaService] Transcoding video for ${momentId}...`);
        await transcodeVideo(tempVideoPath, tempOptimizedPath);

        // 4. Upload Artifacts
        const thumbKey = key.replace('videos/', 'thumbnails/').replace(/\.[^/.]+$/, ".jpg");
        const webKey = key.replace('videos/', 'web/').replace(/\.[^/.]+$/, ".mp4");

        const thumbBuffer = fs.readFileSync(tempThumbPath);
        // For video, we use a stream for upload to be memory efficient
        const optimizedStream = fs.createReadStream(tempOptimizedPath);

        await Promise.all([
            uploadToS3(thumbKey, thumbBuffer, 'image/jpeg'),
            uploadToS3(webKey, optimizedStream, 'video/mp4')
        ]);

        // 5. Update Database
        const updateData = {
            storageThumbKey: thumbKey,
            storageWebKey: webKey,
            storageKey: key,
            occuredAt: metadata.creation_time || new Date(),
            status: 'active'
        };

        await db('moments').where('id', momentId).update(updateData);
        console.log(`[MediaService] Finished Video: ${momentId}`);

    } catch (err) {
        console.error(`[VideoError] ${key}`, err);
        await db('moments').where('id', momentId).update({ status: 'failed' });
        throw err;
    } finally {
        // Cleanup Temp Files
        if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
        if (fs.existsSync(tempThumbPath)) fs.unlinkSync(tempThumbPath);
        if (fs.existsSync(tempOptimizedPath)) fs.unlinkSync(tempOptimizedPath);
    }
}

// --- Helpers ---

async function uploadToS3(key, body, contentType) {
    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType
    }));
}

function getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            const format = metadata.format || {};
            resolve({
                duration: format.duration,
                creation_time: format.tags?.creation_time ? new Date(format.tags.creation_time) : null
            });
        });
    });
}

function generateVideoThumbnail(videoPath, outPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                count: 1,
                folder: path.dirname(outPath),
                filename: path.basename(outPath),
                size: '300x300'
            })
            .on('end', resolve)
            .on('error', reject);
    });
}

function transcodeVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')
            .size('1920x1080') // 1080p (Desktop First)
            .audioCodec('aac')
            .audioBitrate('192k') // Better audio for desktop speakers
            .videoBitrate('4500k') // Higher bitrate for sharp 1080p details (~33MB/min)
            .outputOptions([
                '-preset fast', // Balance speed vs compression
                '-movflags +faststart', // Essential for web streaming
                '-pix_fmt yuv420p' // Max compatibility
            ])
            .on('end', resolve)
            .on('error', reject)
            .run();
    });

    // return new Promise((resolve, reject) => {
    //     ffmpeg(inputPath)
    //         .output(outputPath)
    //         .videoCodec('libx264')
    //         .size('1280x720') // 720p
    //         .audioCodec('aac')
    //         .audioBitrate('128k')
    //         .videoBitrate('1500k') // Reasonable bitrate for web
    //         .outputOptions([
    //             '-preset fast', // Balance speed vs compression
    //             '-movflags +faststart', // Essential for web streaming
    //             '-pix_fmt yuv420p' // Max compatibility
    //         ])
    //         .on('end', resolve)
    //         .on('error', reject)
    //         .run();
    // });
}

module.exports = {
    processUploadedMedia,
};