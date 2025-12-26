import React, { useState, useContext } from 'react';
import MapContext from './MapContext';

export const MapProvider = ({ children }) => {
    const [mapLayers, setMapLayers] = useState([]);

    return (
        <MapContext.Provider value={{ mapLayers, setMapLayers }}>
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
