/**
 * Uploads multiple files with batch signing
 */
async function uploadBatchMedia(activityId, fileList) {
    const files = Array.from(fileList);
    
    // Step 1: Prepare the manifest
    const payload = {
        files: files.map(f => ({ fileName: f.name, fileType: f.type }))
    };

    // Step 2: Get all signatures in ONE request
    const signRes = await fetch(`${import.meta.env.VITE_BASE_API_URL}activities/${activityId}/photos/sign-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const signatures = await signRes.json();

    // Step 3: Match files to signatures and Upload
    // Note: In production, use a library like 'p-limit' to restrict concurrent uploads to ~5
    const uploadPromises = files.map(async (file) => {
        // Find the signature for this specific file
        const sig = signatures.find(s => s.originalName === file.name);

        if (!sig || sig.error) {
            console.error(`Skipping ${file.name}:`, sig?.message);
            return null;
        }

        // Perform the actual S3 upload
        await fetch(sig.signedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
        });

        // Notify backend "I'm Done" (Can also be batched!)
        await fetch(`${import.meta.env.VITE_BASE_API_URL}activities/${activityId}/photos/finalize`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ key: sig.key })
        });

        return sig.key;
    });

    return Promise.all(uploadPromises);
}

export { uploadBatchMedia };