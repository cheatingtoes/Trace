import React from 'react';
import styles from './UploadProgress.module.css';

const UploadProgress = ({ failedUploads, uploadingFiles, processingIds }) => {
    // Display progress for items being uploaded AND items being processed by the backend.
    const inFlightMoments = [...uploadingFiles.values(), ...processingIds, ...failedUploads.values()];
    
    if (inFlightMoments.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.spinner}>⏳</div>
            <div>
                <strong>Processing Uploads...</strong>
                <div className={styles.subtext}>{inFlightMoments.length} items remaining</div>
            </div>
            {failedUploads.size > 0 && (
                <div>
                    <strong>Failed Uploads...</strong>
                    <div className={styles.subtext}>{failedUploads.size} Failed</div>
                </div>
            )}
        </div>
    );
};

export default UploadProgress;
