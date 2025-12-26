import api from '../../../api/axios';
import { retryOperation, uploadToS3 } from '../../../utils/upload';

/**
 * An async generator function that orchestrates the upload process
 * for a track file and yields status updates.
 */
export async function* uploadTrackFile({ activityId, file }) {
    if (!file) return;

    const tempId = crypto.randomUUID();
    
    // Yield initial 'uploading' status
    yield { type: 'UPLOADING', payload: { tempId, file } };

    try {
        // --- STEP 1: GET UPLOAD URL ---
        const signResponse = await retryOperation(() => api.post('/tracks/upload-url', {
            activityId,
            file: {
                originalname: file.name,
                size: file.size
            }
        }));

        const { signedUrl, key, trackId, polylineId, status } = signResponse.data;

        if (status === 'duplicate') {
            console.log('duplicate found for track: ', signResponse.data.trackId)
            yield { type: 'DUPLICATE', payload: { tempId, file, trackId } };
        }

        if (!signedUrl || !key) {
            throw new Error('Failed to get upload URL');
        }

        // --- STEP 2: UPLOAD TO S3 ---
        // Force Content-Type to match what backend expects/signs
        // Backend forces 'application/gpx+xml'
        const fileToUpload = file; 
        // Note: fetch() will use the body's type if not overridden, 
        // but our uploadToS3 helper allows us to rely on the passed file.type or we can override headers if needed.
        // However, standard S3 presigned URLs usually enforce the Content-Type used during signing.
        // The backend uses 'application/gpx+xml'.
        // We should ensure the PUT request uses that.
        
        await retryOperation(() => fetch(signedUrl, {
            method: 'PUT',
            body: fileToUpload,
            headers: { 'Content-Type': 'application/gpx+xml' }
        }).then(res => { if (!res.ok) throw new Error('S3 Upload failed'); }));

        // --- STEP 3: CONFIRM UPLOAD ---
        const confirmResponse = await retryOperation(() => api.post('/tracks/confirm-upload', {
            trackId,
            polylineId,
            key
        }));

        const confirmedTrack = confirmResponse.data.track;

        // Yield success/processing status
        // The track might be in 'processing' state
        yield { type: 'PROCESSING', payload: { tempId, trackId, track: confirmedTrack } };

    } catch (err) {
        console.error(`Track upload failed:`, err);
        yield { type: 'FAILED', payload: { tempId, file, reason: err.message || 'Upload failed' } };
    }
}
