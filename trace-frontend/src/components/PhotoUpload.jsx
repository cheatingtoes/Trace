import React, { useState } from 'react';
import { uploadBatchMedia } from '../../utils/upload';
import styles from './PhotoUpload.module.css';
import Button from './ui/Button';

const PhotoUpload = ({ activityId }) => {
  const [files, setFiles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFiles(e.target.files);
      setStatus(`${e.target.files.length} file(s) selected`);
    } else {
      setFiles(null);
      setStatus('');
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setStatus('Please select files to upload first.');
      return;
    }
    if (!activityId) {
        setStatus('Error: Activity ID is missing.');
        return;
    }

    setIsLoading(true);
    setStatus('Uploading...');

    try {
      const result = await uploadBatchMedia(activityId, files);
      const successfulUploads = result.filter(r => r !== null).length;
      setStatus(`Upload complete! ${successfulUploads} of ${files.length} files uploaded successfully.`);
      setFiles(null); // Clear selection after upload
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isError = status.includes('failed') || status.includes('Error');

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Photo Uploader</h2>
      <p className={styles.info}>For Activity ID: <strong>{activityId || '(Not Provided)'}</strong></p>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={isLoading}
        className={styles.fileInput}
      />
      <Button
        onClick={handleUpload}
        disabled={!files || isLoading || !activityId}
      >
        {isLoading ? 'Uploading...' : `Upload ${files ? files.length : ''} File(s)`}
      </Button>
      {status && (
          <p className={`${styles.status} ${isError ? styles.error : styles.success}`}>
              {status}
          </p>
      )}
    </div>
  );
};

export default PhotoUpload;