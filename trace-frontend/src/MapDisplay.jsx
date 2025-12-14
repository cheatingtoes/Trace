import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';

// Fix for Leaflet marker icons not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapDisplay = ({ latitude, longitude, date }) => {
    const [geometryData, setGeometryData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/v1/polylines/85') // Example polyline ID
            .then(response => response.json())
            .then(data => {
                setGeometryData(data.geometry);
            })
            .catch(error => {
                console.error('Error fetching polyline data:', error);
            });
    }, []);

    console.log('Geometry Data:', geometryData);

    const defaultCenter = [39.0, -100.0]; // Center of US
    const zoomLevel = latitude ? 10 : 3;
    // const position = [latitude || defaultCenter[0], longitude || defaultCenter[1]];
    const position = geometryData 
        ? [geometryData.coordinates[0][1], geometryData.coordinates[0][0]] 
        : defaultCenter;
        
    return (
        <MapContainer 
            center={position} 
            zoom={zoomLevel} 
            style={{ height: '500px', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geometryData && <GeoJSON data={geometryData} />}
            {latitude && longitude && (
                <Marker position={position}>
                    <Popup>
                        **Photo Date:** {new Date(date).toLocaleDateString()}
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MapDisplay;