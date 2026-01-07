import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ArrowBigLeft } from 'lucide-react';
import { Pencil } from 'lucide-react';

import styles from './ActivityDetailEdit.module.css';
import ActivityReadView from './ActivityReadView';
import TracksReadView from '../../tracks/components/TracksReadView';
import MomentsReadView from '../../moments/components/MomentsReadView';
import SidebarHeader from '../../../components/SidebarHeader';

import useActivity from '../hooks/useActivity';
import useTracks from '../../tracks/hooks/useTracks';
import useMoments from '../../moments/hooks/useMoments';
import { useMap } from '../../../context/MapProvider';
import useActivityMapLayers from '../hooks/useActivityMapLayers';
import useMomentMapSync from '../../moments/hooks/useMomentMapSync';

const ActivityDetailRead = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hoveredMomentId, setHoveredMomentId] = useState(null);
    const [scrollToMomentId, setScrollToMomentId] = useState(null);
    const [activeMomentId, setActiveMomentId] = useState(null);
    const [selectedMomentForModal, setSelectedMomentForModal] = useState(null);
    const [isScrollSyncEnabled, setIsScrollSyncEnabled] = useState(true);
    const initialPanRef = useRef(false);

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
    
    const { setMapViewport, mapInstance } = useMap();
    const [isZooming, setIsZooming] = useState(false);

    useEffect(() => {
        if (!mapInstance) return;
        const onZoomStart = () => setIsZooming(true);
        const onZoomEnd = () => {
            setIsZooming(false);
            localStorage.setItem('activity-map-zoom', mapInstance.getZoom());
        };
        mapInstance.on('zoomstart', onZoomStart);
        mapInstance.on('zoomend', onZoomEnd);
        return () => {
            mapInstance.off('zoomstart', onZoomStart);
            mapInstance.off('zoomend', onZoomEnd);
        };
    }, [mapInstance]);

    useEffect(() => {
        if (!momentsLoading && moments && moments.length > 0 && !initialPanRef.current) {
            const firstMoment = moments[0];
            setActiveMomentId(firstMoment.id);
            if (firstMoment.lat != null && firstMoment.lon != null) {
                const savedZoom = localStorage.getItem('activity-map-zoom') ? parseInt(localStorage.getItem('activity-map-zoom'), 10) : 10;
                setMapViewport({
                    center: [firstMoment.lat, firstMoment.lon],
                    zoom: savedZoom > 7 ? savedZoom : 10
                });
            }
            initialPanRef.current = true;
        }
    }, [moments, momentsLoading, setMapViewport]);

    // Map Layers Hook
    useActivityMapLayers({
        tracks: isZooming ? [] : tracks,
        moments,
        hoveredMomentId,
        activeMomentId: isZooming ? null : activeMomentId,
        setScrollToMomentId
    });
    const syncMapToMoment = useMomentMapSync(moments, isScrollSyncEnabled);

    const handleMomentSelect = (moment) => {
        if (moment) {
            if (moment.lat != null && moment.lon != null) {
                setMapViewport({
                    center: [moment.lat, moment.lon],
                    zoom: 10 // Close zoom for specific moment
                });
            }
            setSelectedMomentForModal(moment);
        }
    };

    const handleMomentCenter = (momentId) => {
        setActiveMomentId(momentId);
        if (mapInstance && mapInstance.getZoom() < 10) return;
        syncMapToMoment(momentId);
    };

    const handleNextImage = (e) => {
        if (e) e.stopPropagation();
        if (!selectedMomentForModal || !moments) return;
        const currentIndex = moments.findIndex(m => m.id === selectedMomentForModal.id);
        if (currentIndex !== -1 && currentIndex < moments.length - 1) {
            setSelectedMomentForModal(moments[currentIndex + 1]);
        }
    };

    const handlePrevImage = (e) => {
        if (e) e.stopPropagation();
        if (!selectedMomentForModal || !moments) return;
        const currentIndex = moments.findIndex(m => m.id === selectedMomentForModal.id);
        if (currentIndex > 0) {
            setSelectedMomentForModal(moments[currentIndex - 1]);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedMomentForModal(null);
            } else if (e.key === 'ArrowRight') {
                handleNextImage();
            } else if (e.key === 'ArrowLeft') {
                handlePrevImage();
            }
        };

        if (selectedMomentForModal) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedMomentForModal, moments]);

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
                right={
                    <button 
                        onClick={() => navigate('edit')} 
                        style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}
                        title="Edit Activity"
                    >
                        <Pencil />
                    </button>
                }
            />
            <div className={styles.header} style={{ pointerEvents: 'none' }}>
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
                isScrollSyncEnabled={isScrollSyncEnabled}
                onToggleScrollSync={() => setIsScrollSyncEnabled(prev => !prev)}
                onMomentCenter={handleMomentCenter}
                activeMomentId={activeMomentId}
                isZooming={isZooming}
            />
            {selectedMomentForModal && (
                <div className={styles.modalOverlay} onClick={() => setSelectedMomentForModal(null)}>
                    
                    {moments.findIndex(m => m.id === selectedMomentForModal.id) > 0 && (
                        <button className={`${styles.navButton} ${styles.prevButton}`} onClick={handlePrevImage}>
                            &#10094;
                        </button>
                    )}

                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {selectedMomentForModal.storageWebKey ? (
                            <img 
                                src={`${import.meta.env.VITE_S3_PUBLIC_ENDPOINT}/${import.meta.env.VITE_S3_BUCKET_NAME}/${selectedMomentForModal.storageWebKey}`}
                                alt={selectedMomentForModal.name || 'Moment Detail'}
                                className={styles.modalImage}
                            />
                        ) : (
                            <div style={{color: 'white', fontSize: '1.2rem'}}>Image not available</div>
                        )}
                    </div>

                    {moments.findIndex(m => m.id === selectedMomentForModal.id) < moments.length - 1 && (
                        <button className={`${styles.navButton} ${styles.nextButton}`} onClick={handleNextImage}>
                            &#10095;
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityDetailRead;