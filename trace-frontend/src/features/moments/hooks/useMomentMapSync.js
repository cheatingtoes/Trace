import { useCallback } from 'react';
import L from 'leaflet';
import { useMap } from '../../../context/MapProvider';

const useMomentMapSync = (moments, isScrollSyncEnabled) => {
    const { setMapViewport, mapInstance } = useMap();

    const syncMapToMoment = useCallback((momentId) => {
        if (isScrollSyncEnabled) {
            const moment = moments.find(m => m.id === momentId);
            if (moment && moment.lat != null && moment.lon != null) {
                const targetZoom = 10;
                if (mapInstance) {
                    const bounds = mapInstance.getBounds();
                    const currentZoom = mapInstance.getZoom();
                    const latLng = L.latLng(moment.lat, moment.lon);
                    
                    // Only skip if contained in bounds AND we are at least at the target zoom
                    if (bounds.contains(latLng) && currentZoom >= targetZoom) {
                        return;
                    }
                }
                setMapViewport({
                    center: [moment.lat, moment.lon],
                    zoom: targetZoom
                });
            }
        }
    }, [moments, isScrollSyncEnabled, mapInstance, setMapViewport]);

    return syncMapToMoment;
};

export default useMomentMapSync;
