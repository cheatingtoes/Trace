import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import L from 'leaflet';
import { Polyline, Marker, Popup } from 'react-leaflet';
import styles from './ActivityDetail.module.css';
import ActivityEditView from './ActivityEditView';
import TracksEditView from '../../tracks/components/TracksEditView';
import MomentsEditView from '../../moments/components/MomentsEditView';
import UploadProgress from '../../moments/components/UploadProgress';
import SidebarHeader from '../../../components/SidebarHeader';

import useActivity from '../hooks/useActivity';
import useTracks from '../../tracks/hooks/useTracks';
import useMoments from '../../moments/hooks/useMoments';
import useMomentPoller from '../../moments/hooks/useMomentPoller';
import useTrackPoller from '../../tracks/hooks/useTrackPoller';
import { useMap } from '../../../context/MapProvider';

const ActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hoveredMomentId, setHoveredMomentId] = useState(null);
    const { activity, loading: activityLoading, error: activityError, fetchActivity, updateActivity } = useActivity(id);
    const { 
        tracks, 
        processingIds: trackProcessingIds, 
        uploadingFiles: trackUploadingFiles, 
        failedUploads: trackFailedUploads, 
        updateTracksState, 
        loading: tracksLoading, 
        error: tracksError, 
        fetchTracks, 
        uploadTrack, 
        deleteTrack 
    } = useTracks(id);
    
    const { 
        moments, 
        failedUploads: momentFailedUploads, 
        duplicates: momentDuplicates,
        uploadingFiles: momentUploadingFiles, 
        processingIds: momentProcessingIds, 
        loading: momentsLoading, 
        error: momentsError, 
        fetchMoments, 
        uploadMoments, 
        deleteMoment, 
        updateMoment, 
        updateMomentsState 
    } = useMoments(id);
    
    const { setMapLayers, setMapViewport } = useMap();

    const isEditing = true;

    // Poller will automatically pick up new IDs as they are added to the moments list
    useMomentPoller(momentProcessingIds, updateMomentsState);
    useTrackPoller(trackProcessingIds, updateTracksState);

    // Merge upload states for the progress indicator
    const allProcessingIds = [...momentProcessingIds, ...trackProcessingIds];
    const allUploadingFiles = new Map([...momentUploadingFiles, ...trackUploadingFiles]);
    const allFailedUploads = new Map([...momentFailedUploads, ...trackFailedUploads]);

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
                            key={`track-${track.id}`} 
                            positions={positions} 
                            color="blue" 
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
                right={<span style={{ cursor: 'pointer' }}>⚙️</span>}
            />
            {isEditing ? (
                <>
                    <div className={styles.header}>
                        <h2>EDIT ACTIVITY</h2>
                    </div>
                    <ActivityEditView activity={activity} updateActivity={updateActivity}/>
                    <TracksEditView tracks={tracks} loading={tracksLoading} error={tracksError} onUpload={uploadTrack} onDelete={deleteTrack} />
                    <MomentsEditView 
                        moments={moments} 
                        loading={momentsLoading} 
                        error={momentsError} 
                        onUpload={uploadMoments} 
                        onDelete={deleteMoment} 
                        onMomentHover={setHoveredMomentId}
                        onMomentSelect={handleMomentSelect}
                        onNameChange={(id, name) => updateMoment(id, { name })}
                        onUpdateMoment={updateMoment}
                        onFetchMoments={fetchMoments}
                        activityId={id}
                    />
                    <UploadProgress failedUploads={allFailedUploads} uploadingFiles={allUploadingFiles} processingIds={allProcessingIds} duplicates={momentDuplicates} />
                </>
            ) : (
                <>
                    <div className={styles.header}>
                        <h2>ACTIVITY DETAILS</h2>
                    </div>
                    <div className={styles.content}>
                        <p>Details for Activity ID: {id}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default ActivityDetail;