import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import L from 'leaflet';
import { Polyline, Marker, Popup } from 'react-leaflet';
import styles from './ActivityDetail.module.css';
import ActivityReadView from './ActivityReadView';
import TracksReadView from '../../tracks/components/TracksReadView';
import MomentsReadView from '../../moments/components/MomentsReadView';
import SidebarHeader from '../../../components/SidebarHeader';

import useActivity from '../hooks/useActivity';
import useTracks from '../../tracks/hooks/useTracks';
import useMoments from '../../moments/hooks/useMoments';
import { useMap } from '../../../context/MapProvider';

const ActivityDetailRead = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hoveredMomentId, setHoveredMomentId] = useState(null);
    const [scrollToMomentId, setScrollToMomentId] = useState(null);
    const { activity, loading: activityLoading, error: activityError } = useActivity(id);
    const { 
        tracks, 
        loading: tracksLoading, 
        error: tracksError 
    } = useTracks(id);
    
    const { 
        moments, 
        loading: momentsLoading, 
        error: momentsError, 
    } = useMoments(id);
    
    const { setMapLayers, setMapViewport } = useMap();

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

    const handleMomentSelect = (momentId) => {
        const moment = moments.find(m => m.id === momentId);
        if (moment && moment.lat != null && moment.lon != null) {
            setMapViewport({
                center: [moment.lat, moment.lon],
                zoom: 10 // Close zoom for specific moment
            });
        }
    };

    // Update Map Layers
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
                // Backend now returns lat/lon directly
                const isHovered = moment.id === hoveredMomentId;
                if (moment.lat != null && moment.lon != null) {
                    layers.push(
                        <Marker 
                            key={`moment-${moment.id}`} 
                            position={[moment.lat, moment.lon]}
                            icon={isHovered ? highlightedIcon : defaultIcon}
                            eventHandlers={{ click: () => setScrollToMomentId(moment.id) }}
                        >
                            <Popup><img src={`${import.meta.env.VITE_S3_PUBLIC_ENDPOINT}/${import.meta.env.VITE_S3_BUCKET_NAME}/${moment.storageThumbKey}`} />{`${import.meta.env.VITE_S3_PUBLIC_ENDPOINT}/${import.meta.env.VITE_S3_BUCKET_NAME}/${moment.storageThumbKey}`}</Popup>
                        </Marker>
                    );
                }
            });
        }

        setMapLayers(layers);

        return () => {
            setMapLayers([]);
        };
    }, [tracks, moments, setMapLayers, hoveredMomentId, defaultIcon, highlightedIcon]);

    return (
        <div className={styles.detailContainer}>
            <SidebarHeader
                left={
                    <>
                        <button onClick={() => navigate(-1)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem', marginRight: '0.5rem' }}>
                            ←
                        </button>
                    </>
                }
                right={
                    <button 
                        onClick={() => navigate('edit')} 
                        style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}
                        title="Edit Activity"
                    >
                        ✏️
                    </button>
                }
            />
            <div className={styles.header}>
                <h2>Activity Details</h2>
            </div>
            <ActivityReadView activity={activity} />
            <TracksReadView 
                tracks={tracks} 
            />
            <MomentsReadView 
                moments={moments} 
                onMomentHover={setHoveredMomentId}
                onMomentSelect={handleMomentSelect}
                scrollToMomentId={scrollToMomentId}
                onScrollComplete={() => setScrollToMomentId(null)}
            />
        </div>
    );
};

export default ActivityDetailRead;