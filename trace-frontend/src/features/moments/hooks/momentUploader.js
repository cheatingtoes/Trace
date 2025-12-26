import api from '../../../api/axios';

// Helper: Generic Retry Logic with Exponential Backoff
const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (err) {
            // If it's a 4xx error (User Error), usually don't retry.
            if (err.response && err.response.status >= 400 && err.response.status < 500) {
                throw err;
            }
            if (i === maxRetries - 1) throw err;
            const delay = baseDelay * Math.pow(2, i);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

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

    const BATCH_SIZE = 50;
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
                const { tempId, signedUrl } = signedData;
                if (!signedUrl) return { tempId, success: false, reason: 'Signing failed' };

                const originalFile = fileMap.get(tempId);
                try {
                    await retryOperation(() => fetch(signedUrl, {
                        method: 'PUT',
                        body: originalFile,
                        headers: { 'Content-Type': originalFile.type }
                    }).then(res => { if (!res.ok) throw new Error('S3 Upload failed'); }));
                    return { ...signedData, success: true };
                } catch (err) {
                    return { tempId, success: false, reason: err.message, file: originalFile };
                }
            }));

            // --- STEP 3: CONFIRM BATCH ---
            const successfulUploads = uploadResults.filter(r => r.success);
            const failedInUpload = uploadResults.filter(r => !r.success);

            for (const failed of failedInUpload) {
                yield { type: 'FAILED', payload: { tempId: failed.tempId, file: failed.file, reason: failed.reason } };
            }

            if (successfulUploads.length > 0) {
                const confirmResponse = await retryOperation(() => api.post('/moments/confirm-batch', {
                    activityId,
                    uploads: successfulUploads.map(u => ({ momentId: u.id, meta: {} }))
                }));

                const confirmedMoments = confirmResponse.data;
                if (Array.isArray(confirmedMoments)) {
                    const successfulUploadsMap = new Map(successfulUploads.map(u => [u.id, u]));
                    for (const moment of confirmedMoments) {
                        const uploadRecord = successfulUploadsMap.get(moment.id);
                        if (uploadRecord) {
                            yield { type: 'PROCESSING', payload: { tempId: uploadRecord.tempId, moment } };
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