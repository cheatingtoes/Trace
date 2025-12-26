import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
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
import { useMap } from '../../../context/MapProvider';

const ActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activity, loading: activityLoading, error: activityError, fetchActivity, updateActivity } = useActivity(id);
    const { tracks, loading: tracksLoading, error: tracksError, fetchTracks, uploadTrack, deleteTrack } = useTracks(id);
    const { moments, failedUploads, uploadingFiles, processingIds, loading: momentsLoading, error: momentsError, fetchMoments, uploadMoments, deleteMoment, updateMoment, updateMomentsState } = useMoments(id);
    const { setMapLayers } = useMap();

    const isEditing = true;

    // Poller will automatically pick up new IDs as they are added to the moments list
    useMomentPoller(processingIds, updateMomentsState);

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
                if (moment.lat != null && moment.lon != null) {
                    layers.push(
                        <Marker 
                            key={`moment-${moment.id}`} 
                            position={[moment.lat, moment.lon]}
                        >
                            <Popup><img src={moment.thumbnailUrl} /></Popup>
                        </Marker>
                    );
                }
            });
        }

        setMapLayers(layers);

        return () => {
            setMapLayers([]);
        };
    }, [tracks, moments, setMapLayers]);

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
                    <UploadProgress failedUploads={failedUploads} uploadingFiles={uploadingFiles} processingIds={processingIds} />
                    <MomentsEditView 
                        moments={moments} 
                        loading={momentsLoading} 
                        error={momentsError} 
                        onUpload={uploadMoments} 
                        onDelete={deleteMoment} 
                        onNameChange={(id, name) => updateMoment(id, { name })}
                    />
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