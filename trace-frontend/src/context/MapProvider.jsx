import React, { useState, useContext, useMemo } from 'react';
import MapContext from './MapContext';

export const MapProvider = ({ children }) => {
    const [mapLayers, setMapLayers] = useState([]);
    const [mapViewport, setMapViewport] = useState(null);
    const [mapPadding, setMapPadding] = useState({ left: 0, right: 0, top: 0, bottom: 0 }); // Padding in px
    const [mapInstance, setMapInstance] = useState(null);

    const value = useMemo(() => ({
        mapLayers, setMapLayers,
        mapViewport, setMapViewport,
        mapPadding, setMapPadding,
        mapInstance, setMapInstance
    }), [mapLayers, mapViewport, mapPadding, mapInstance]);

    return (
        <MapContext.Provider value={value}>
            {children}
        </MapContext.Provider>
    );
};

export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};