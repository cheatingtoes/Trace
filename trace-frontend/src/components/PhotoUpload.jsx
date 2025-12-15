import React, { useState } from 'react';
import { uploadBatchMedia } from '../../utils/upload';

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

  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', maxWidth: '400px', margin: '16px auto' }}>
      <h2>Photo Uploader</h2>
      <p>For Activity ID: <strong>{activityId || '(Not Provided)'}</strong></p>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={isLoading}
        style={{ display: 'block', marginBottom: '8px' }}
      />
      <button
        onClick={handleUpload}
        disabled={!files || isLoading || !activityId}
      >
        {isLoading ? 'Uploading...' : `Upload ${files ? files.length : ''} File(s)`}
      </button>
      {status && <p style={{ marginTop: '12px', color: status.includes('failed') || status.includes('Error') ? '#D32F2F' : '#388E3C', fontWeight: 'bold' }}>{status}</p>}
    </div>
  );
};

export default PhotoUpload;