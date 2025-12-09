import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for Leaflet marker icons not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapDisplay = ({ latitude, longitude, date }) => {
    const defaultCenter = [39.0, -100.0]; // Center of US
    const zoomLevel = latitude ? 10 : 3;
    const position = [latitude || defaultCenter[0], longitude || defaultCenter[1]];

    return (
        <MapContainer 
            center={position} 
            zoom={zoomLevel} 
            style={{ height: '500px', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

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