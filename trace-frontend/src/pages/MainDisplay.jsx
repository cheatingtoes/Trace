import React, { useState } from 'react';
import PhotoUpload from '../components/PhotoUpload';
import LogoutButton from '../features/auth/components/LogoutButton';
import styles from './MainDisplay.module.css'; 

const MainDisplay = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [photoData, setPhotoData] = useState(null); 
    const [message, setMessage] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setPhotoData(null);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Please select a photo first!');
            return;
        }

        setMessage('Uploading and processing photo...');

        const formData = new FormData();
        formData.append('photo', selectedFile);

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/upload-photo`, {
                method: 'POST',
                body: formData, 
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setPhotoData(data.data); 
                setMessage(`Success! Photo ID ${data.data.id} saved to DB.`);
            } else {
                setMessage(`Error: ${data.message || 'Could not process the photo.'}`);
                setPhotoData(null);
            }
        } catch (error) {
            console.error('Network or server error:', error);
            setMessage('Network error. Is the backend running?');
            setPhotoData(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>TRACE</h1>
                <LogoutButton />
            </div>
            
            <div className={styles.controls}>
                <p>Upload and map your trail photos.</p>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button onClick={handleUpload} disabled={!selectedFile}>
                    Upload & Map Location
                </button>
                {message && <p className={styles.message}>{message}</p>}
            </div>

            <div className={styles.photoUpload}>
              <PhotoUpload activityId="1" />
            </div>
        </div>
    );
}

export default MainDisplay;