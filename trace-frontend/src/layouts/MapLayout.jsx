import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MapContainer, TileLayer, useMap as useLeafletMap } from 'react-leaflet';
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

const MapController = () => {
    const map = useLeafletMap();
    const { mapViewport, mapPadding } = useMap();

    useEffect(() => {
        if (mapViewport) {
            const { center, zoom } = mapViewport;
            if (center) {
                const targetZoom = zoom || map.getZoom();
                
                // Calculate offset in pixels
                // If left padding > right padding, visible center is to the right.
                // We want target (center) to be at visible center.
                // So we need to shift the map center to the left (negative X).
                // Offset = (Left - Right) / 2
                
                const xOffset = (mapPadding.left - mapPadding.right) / 2;
                const yOffset = (mapPadding.top - mapPadding.bottom) / 2;

                if (xOffset === 0 && yOffset === 0) {
                     map.flyTo(center, targetZoom);
                } else {
                     // Project to pixel coordinates, apply offset, unproject
                     const targetPoint = map.project(center, targetZoom);
                     const newTargetPoint = targetPoint.subtract([xOffset, yOffset]);
                     const newCenter = map.unproject(newTargetPoint, targetZoom);
                     
                     map.flyTo(newCenter, targetZoom);
                }
            }
        }
    }, [mapViewport, map, mapPadding]);

    return null;
};

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
                <MapController />
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
