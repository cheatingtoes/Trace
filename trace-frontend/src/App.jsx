import React, { useState } from 'react';
import MapDisplay from './MapDisplay';
import './index.css'; 

function App() {
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
            // Backend is accessed via the service name 'backend' in a production scenario, 
            // but we use 'localhost:3001' on the host machine for dev access.
            const response = await fetch('http://localhost:3001/upload-photo', {
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
            <h1>TRACE: Trail Photo Mapper</h1>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!selectedFile} style={{ marginLeft: '10px' }}>
                Upload & Map Location
            </button>

            <p style={{ marginTop: '10px' }}><strong>{message}</strong></p>

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

export default App;