import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowBigLeft, Trash2 } from 'lucide-react';

import styles from './ActivityDetailEdit.module.css';
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
import useActivityMapLayers from '../hooks/useActivityMapLayers';
import useMomentMapSync from '../../moments/hooks/useMomentMapSync';

const ActivityDetailEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hoveredMomentId, setHoveredMomentId] = useState(null);
    const [scrollToMomentId, setScrollToMomentId] = useState(null);
    const { activity, loading: activityLoading, error: activityError, fetchActivity, updateActivity, deleteActivity } = useActivity(id);
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
        deleteTrack,
        updateTrack
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
    
    const { setMapViewport, mapInstance } = useMap();
    const [activeMomentId, setActiveMomentId] = useState(null);
    const [isScrollSyncEnabled, setIsScrollSyncEnabled] = useState(true);
    const [isZooming, setIsZooming] = useState(false);

    useEffect(() => {
        if (!mapInstance) return;
        const onZoomStart = () => setIsZooming(true);
        const onZoomEnd = () => setIsZooming(false);
        mapInstance.on('zoomstart', onZoomStart);
        mapInstance.on('zoomend', onZoomEnd);
        return () => {
            mapInstance.off('zoomstart', onZoomStart);
            mapInstance.off('zoomend', onZoomEnd);
        };
    }, [mapInstance]);

    const isEditing = true;

    // Poller will automatically pick up new IDs as they are added to the moments list
    useMomentPoller(momentProcessingIds, updateMomentsState);
    useTrackPoller(trackProcessingIds, updateTracksState);

    // Merge upload states for the progress indicator
    const allProcessingIds = [...momentProcessingIds, ...trackProcessingIds];
    const allUploadingFiles = new Map([...momentUploadingFiles, ...trackUploadingFiles]);
    const allFailedUploads = new Map([...momentFailedUploads, ...trackFailedUploads]);

    // Map Layers Hook
    useActivityMapLayers({
        tracks: isZooming ? [] : tracks,
        moments,
        hoveredMomentId,
        activeMomentId,
        setScrollToMomentId
    });
    const syncMapToMoment = useMomentMapSync(moments, isScrollSyncEnabled);

    const handleMomentSelect = (momentId) => {
        const moment = moments.find(m => m.id === momentId);
        if (moment && moment.lat != null && moment.lon != null) {
            setMapViewport({
                center: [moment.lat, moment.lon],
                zoom: 10 // Close zoom for specific moment
            });
        }
    };

    const handleMomentCenter = (momentId) => {
        setActiveMomentId(momentId);
        syncMapToMoment(momentId);
    };

    const handleDeleteActivity = async () => {
        if (window.confirm("Are you sure you want to delete this activity?")) {
            const success = await deleteActivity();
            if (success) {
                navigate(-1);
            }
        }
    };

    return (
        <div className={styles.detailContainer}>
            <SidebarHeader
                left={
                    <>
                        <button onClick={() => navigate(-1)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem', marginRight: '0.5rem' }}>
                            <ArrowBigLeft />
                        </button>
                    </>
                }
                right={<span onClick={handleDeleteActivity} style={{ cursor: 'pointer' }}><Trash2 /></span>}
            />
            <div className={styles.header}>
                <h2>Edit Activity</h2>
            </div>
            <ActivityEditView activity={activity} updateActivity={updateActivity}/>
            <TracksEditView 
                tracks={tracks} 
                loading={tracksLoading} 
                error={tracksError} 
                onUpload={uploadTrack} 
                onDelete={deleteTrack}
                onColorChange={(id, color) => updateTrack(id, { color })}
                onNameChange={(id, name) => updateTrack(id, { name })}
            />
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
                scrollToMomentId={scrollToMomentId}
                onScrollComplete={() => setScrollToMomentId(null)}
                onMomentCenter={handleMomentCenter}
                activeMomentId={activeMomentId}
                isScrollSyncEnabled={isScrollSyncEnabled}
                onToggleScrollSync={() => setIsScrollSyncEnabled(prev => !prev)}
            />
            <UploadProgress failedUploads={allFailedUploads} uploadingFiles={allUploadingFiles} processingIds={allProcessingIds} duplicates={momentDuplicates} />
        </div>
    );
};

export default ActivityDetailEdit;