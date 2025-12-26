
/**
 * Generic Retry Logic with Exponential Backoff
 * @param {Function} operation - Function returning a promise
 * @param {number} maxRetries 
 * @param {number} baseDelay 
 */
export const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
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
 * Uploads a file to S3 using a presigned URL
 * @param {string} signedUrl 
 * @param {File} file 
 */
export const uploadToS3 = async (signedUrl, file) => {
    return fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' }
    }).then(res => {
        if (!res.ok) throw new Error('S3 Upload failed');
        return res;
    });
};
