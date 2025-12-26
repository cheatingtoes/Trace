import React from 'react';
import styles from './UploadProgress.module.css';

const UploadProgress = ({ moments }) => {
    // Display progress for items being uploaded AND items being processed by the backend.
    const inFlightMoments = moments.filter(m => m.status === 'uploading' || m.status === 'processing');
    
    if (inFlightMoments.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.spinner}>⏳</div>
            <div>
                <strong>Processing Uploads...</strong>
                <div className={styles.subtext}>{inFlightMoments.length} items remaining</div>
            </div>
        </div>
    );
};

export default UploadProgress;
