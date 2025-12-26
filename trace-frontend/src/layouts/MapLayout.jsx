import React from 'react';
import { Outlet } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapLayout.module.css';
import { MapProvider, useMap } from '../context/MapProvider';

// Fix for Leaflet marker icons not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const InnerMapLayout = () => {
    const defaultCenter = [39.0, -100.0]; // Center of US
    const zoomLevel = 3;
    const { mapLayers } = useMap();

    return (
        <div className={styles.mapLayout}>
            <MapContainer 
                center={defaultCenter} 
                zoom={zoomLevel} 
                className={styles.mapContainer}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapLayers}
            </MapContainer>
            <Outlet />
        </div>
    );
};

const MapLayout = () => {
    return (
        <MapProvider>
            <InnerMapLayout />
        </MapProvider>
    );
};

export default MapLayout;
