import React, { useState } from 'react';
import MapDisplay from './MapDisplay';
import PhotoUpload from '../components/PhotoUpload';
import LogoutButton from '../features/auth/components/LogoutButton';
import './MainDisplay.module.css'; 

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
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <LogoutButton />
            <h1>TRACE: Trail Photo Mapper</h1>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!selectedFile} style={{ marginLeft: '10px' }}>
                Upload & Map Location
            </button>

            <p style={{ marginTop: '10px' }}><strong>{message}</strong></p>

            <hr style={{ margin: '30px 0' }} />
            <PhotoUpload activityId="1" />
            <hr style={{ margin: '30px 0' }} />

            <div style={{ marginTop: '30px' }}>
                <MapDisplay 
                    latitude={photoData?.latitude} 
                    longitude={photoData?.longitude} 
                    date={photoData?.date}
                />
            </div>
        </div>
    );
}

export default MainDisplay;