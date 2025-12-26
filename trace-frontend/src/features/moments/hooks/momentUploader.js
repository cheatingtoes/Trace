import api from '../../../api/axios';
import { retryOperation, uploadToS3 } from '../../../utils/upload';

/**
 * An async generator function that orchestrates the multi-step upload process
 * for moment files and yields status updates.
 */
export async function* uploadMomentFiles({ activityId, filesInput }) {
    // 1. Normalize Input
    let fileMap;
    if (filesInput instanceof Map) {
        fileMap = filesInput;
    } else if (filesInput && filesInput.length > 0) {
        fileMap = new Map(
            Array.from(filesInput).map(file => [crypto.randomUUID(), file])
        );
    } else {
        return; // Nothing to upload
    }

    // Yield initial 'uploading' status for all files
    for (const [tempId, file] of fileMap.entries()) {
        yield { type: 'UPLOADING', payload: { tempId, file } };
    }

    const BATCH_SIZE = 1;
    const entries = Array.from(fileMap.entries());

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE);
        const batchMap = new Map(batch);

        try {
            // --- STEP 1: SIGN BATCH ---
            const batchPayload = batch.map(([tempId, file]) => ({
                tempId,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                lastModified: file.lastModified
            }));

            const signResponse = await retryOperation(() => api.post('/moments/sign-batch', {
                activityId,
                files: batchPayload
            }));

            const signedFiles = Array.isArray(signResponse.data) ? signResponse.data : [];

            // --- STEP 2: UPLOAD TO S3 ---
            const uploadResults = await Promise.all(signedFiles.map(async (signedData) => {
                const { tempId, signedUrl, status } = signedData;

                if (status === 'duplicate') {
                    // The backend returns the existing moment's ID.
                    return { tempId, success: true, status: 'duplicate', momentId: signedData.id };
                }

                if (!signedUrl) return { tempId, success: false, reason: 'Signing failed' };

                const originalFile = fileMap.get(tempId);
                try {
                    await retryOperation(() => uploadToS3(signedUrl, originalFile));
                    return { ...signedData, success: true };
                } catch (err) {
                    return { tempId, success: false, reason: err.message, file: originalFile };
                }
            }));

            // --- STEP 3: PROCESS UPLOAD RESULTS & CONFIRM ---
            const successfulUploads = [];

            for (const result of uploadResults) {
                if (!result.success) {
                    yield { type: 'FAILED', payload: { tempId: result.tempId, file: result.file, reason: result.reason } };
                } else if (result.status === 'duplicate') {
                    yield { type: 'DUPLICATE', payload: { tempId: result.tempId, momentId: result.momentId, file: fileMap.get(result.tempId) } };
                } else {
                    successfulUploads.push(result);
                }
            }

            if (successfulUploads.length > 0) {
                const confirmResponse = await retryOperation(() => api.post('/moments/confirm-batch', {
                    activityId,
                    uploads: successfulUploads.map(u => ({ momentId: u.id, meta: {} }))
                }));

                const confirmedMoments = confirmResponse.data;
                if (Array.isArray(confirmedMoments)) {
                    const successfulUploadsMap = new Map(successfulUploads.map(u => [u.id, u]));
                    for (const momentId of confirmedMoments) {
                        const uploadRecord = successfulUploadsMap.get(momentId);
                        if (uploadRecord) {
                            yield { type: 'PROCESSING', payload: { tempId: uploadRecord.tempId, momentId } };
                        }
                    }
                }
            }
        } catch (batchError) {
            console.error(`Batch failed:`, batchError);
            for (const [tempId, file] of batchMap.entries()) {
                yield { type: 'FAILED', payload: { tempId, file, reason: batchError.message } };
            }
        }
    }
}