import React, { useMemo, useEffect } from 'react';
import L from 'leaflet';
import { Polyline, Marker, Popup } from 'react-leaflet';
import { useMap } from '../../../context/MapProvider';

const useActivityMapLayers = ({
    tracks,
    moments,
    hoveredMomentId,
    activeMomentId,
    setScrollToMomentId
}) => {
    const { setMapLayers } = useMap();

    const defaultIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    }), []);

    const highlightedIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    }), []);

    useEffect(() => {
        const layers = [];

        if (tracks) {
            tracks.forEach(track => {
                const { polyline } = track;
                if (polyline && polyline.coordinates && Array.isArray(polyline.coordinates)) {
                    // GeoJSON is [lon, lat], Leaflet wants [lat, lon]
                    const positions = polyline.coordinates.map(coord => [coord[1], coord[0]]);
                    
                    layers.push(
                        <Polyline 
                            key={`track-${track.id}-${track.color || 'blue'}`} 
                            positions={positions} 
                            color={track.color || 'blue'} 
                        />
                    );
                }
            });
        }

        if (moments) {
            moments.forEach(moment => {
                const isHovered = moment.id === hoveredMomentId;
                const isActive = moment.id === activeMomentId;
                if (moment.lat != null && moment.lon != null) {
                    layers.push(
                        <Marker 
                            key={`moment-${moment.id}`} 
                            position={[moment.lat, moment.lon]}
                            icon={isHovered || isActive ? highlightedIcon : defaultIcon}
                            eventHandlers={{ click: () => setScrollToMomentId(moment.id) }}
                        >
                            <Popup>
                                <img src={`${import.meta.env.VITE_S3_PUBLIC_ENDPOINT}/${import.meta.env.VITE_S3_BUCKET_NAME}/${moment.storageThumbKey}`} />
                                {`${import.meta.env.VITE_S3_PUBLIC_ENDPOINT}/${import.meta.env.VITE_S3_BUCKET_NAME}/${moment.storageThumbKey}`}
                            </Popup>
                        </Marker>
                    );
                }
            });
        }

        setMapLayers(layers);

        return () => {
            setMapLayers([]);
        };
    }, [tracks, moments, setMapLayers, hoveredMomentId, activeMomentId, defaultIcon, highlightedIcon, setScrollToMomentId]);
};

export default useActivityMapLayers;
