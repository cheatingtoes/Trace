import { useState, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Polyline, Marker, Popup } from 'react-leaflet';
import ActivityForm from './ActivityForm'; // Assuming CreateActivity is in the same directory
import ActivityList from './ActivityList';     // Assuming ActivityList is in the same directory
import styles from './ActivityDashboard.module.css';
import ActivityFormStyles from './ActivityForm.module.css';
import useActivities from '../hooks/useActivities';
import SidebarHeader from '../../../components/SidebarHeader';
import { useMap } from '../../../context/MapProvider';

const ActivityDashboard = () => {
    const { activities, loading, error, createActivity, fetchActivities } = useActivities();
    const [isExpanded, setIsExpanded] = useState(false);
    const { setMapLayers, setMapViewport, mapInstance } = useMap();
    const [isZooming, setIsZooming] = useState(false);

    useEffect(() => {
        if (!mapInstance) return;
        const onZoomStart = () => setIsZooming(true);
        const onZoomEnd = () => setIsZooming(false);
        mapInstance.on('zoomstart', onZoomStart);
        mapInstance.on('zoomend', onZoomEnd);
            mapInstance.off('zoomstart', onZoomStart);
            mapInstance.off('zoomend', onZoomEnd);
        };
    }, [mapInstance]);

    const handleActivityCreated = () => {
        setIsExpanded(false);
    };

    const defaultIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    }), []);

    useEffect(() => {
        setMapViewport({
            center: [39.0, -100.0],
            zoom: 3
        });
    }, [setMapViewport]);

    useEffect(() => {
        if (!activities) return;

        const layers = [];

        activities.forEach(activity => {
            // Render Tracks
            if (activity.tracks && !isZooming) {
                activity.tracks.forEach(track => {
                    const { polyline, color } = track;
                    if (polyline && polyline.coordinates && Array.isArray(polyline.coordinates)) {
                         // GeoJSON is [lon, lat], Leaflet wants [lat, lon]
                        const positions = polyline.coordinates.map(coord => [coord[1], coord[0]]);
                        layers.push(
                            <Polyline
                                key={`track-${track.id}`}
                                positions={positions}
                                color={color || 'blue'}
                            />
                        );
                    }
                });
            }

            // Render Clusters
            if (activity.clusters) {
                activity.clusters.forEach(cluster => {
                    if (cluster.lat != null && cluster.lon != null) {
                        layers.push(
                            <Marker
                                key={`cluster-${cluster.id}`}
                                position={[cluster.lat, cluster.lon]}
                                icon={defaultIcon}
                            >
                                <Popup>
                                    <div>
                                        <strong>{cluster.name || 'Cluster'}</strong>
                                        {cluster.description && <p>{cluster.description}</p>}
                                        <small>{activity.title}</small>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }
                });
            }
        });

        setMapLayers(layers);

        return () => {
            setMapLayers([]);
        };
    }, [activities, setMapLayers, defaultIcon, isZooming]);

    return (
        <div className={styles.dashboardContainer}>
            <SidebarHeader
                left={<h2>YOUR JOURNEYS</h2>}
                right={
                    <div className={styles.createActivityButton}>
                        <button onClick={() => setIsExpanded(!isExpanded)} className={ActivityFormStyles.expandButton}>
                            {isExpanded ? '-' : '+'}
                        </button>
                    </div>
                }
            />
            <ActivityForm onSubmit={createActivity} onSuccess={handleActivityCreated} isOpen={isExpanded} onClose={() => setIsExpanded(false)} />
            <div className={styles.yourJourneys}>
                <ActivityList activities={activities} loading={loading} error={error} />
            </div>
        </div>
    );
};

export default ActivityDashboard;
