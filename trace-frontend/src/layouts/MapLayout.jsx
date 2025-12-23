import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapLayout.module.css';

// Fix for Leaflet marker icons not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapLayout = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const defaultCenter = [39.0, -100.0]; // Center of US
    const zoomLevel = 3;

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
            </MapContainer>
            {isAuthPage && <div className={styles.mapOverlay} />}
            <div className={styles.content}>
                <Outlet />
            </div>
        </div>
    );
};

export default MapLayout;
