import React, { useState, useEffect } from 'react';
import styles from './UploadProgress.module.css';

const UploadProgress = ({ failedUploads, uploadingFiles, processingIds, duplicates }) => {
    const [dismissed, setDismissed] = useState(false);

    // Display progress for items being uploaded AND items being processed by the backend.
    const inFlightMoments = [...uploadingFiles.values(), ...processingIds, ...failedUploads.values()];
    
    const hasItems = inFlightMoments.length > 0 || (duplicates && duplicates.size > 0);

    // Reset dismissed state when the list clears, so it reappears for the next batch
    useEffect(() => {
        if (!hasItems) {
            setDismissed(false);
        }
    }, [hasItems]);

    if (!hasItems || dismissed) return null;

    return (
        <div className={styles.container} style={{ position: 'sticky', bottom: 0, zIndex: 100, backgroundColor: 'white', borderTop: '1px solid #eee', padding: '10px' }}>
            <button 
                onClick={() => setDismissed(true)}
                style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#666' }}
                aria-label="Close"
            >
                ✕
            </button>
            <div className={styles.spinner}>⏳</div>
            <div>
                <strong>Processing Uploads...</strong>
                <div className={styles.subtext}>{inFlightMoments.length} items remaining</div>
            </div>
            {duplicates && duplicates.size > 0 && (
                <div style={{ marginLeft: '1rem', color: '#856404' }}>
                    <strong>Skipped Duplicates</strong>
                    <div className={styles.subtext}>{duplicates.size} files already exist</div>
                </div>
            )}
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
