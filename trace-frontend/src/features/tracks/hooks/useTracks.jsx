import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import { uploadTrackFile } from './trackUploader';

const useTracks = (activityId = null) => {
    const [tracks, setTracks] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(new Map()); // Map<tempId, File>
    const [processingIds, setProcessingIds] = useState(new Set());   // Set<trackId>
    const [failedUploads, setFailedUploads] = useState(new Map());   // Map<tempId, File>
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTracks = useCallback(async () => {
        setLoading(true);
        try {
            const url = activityId ? `/activities/${activityId}/tracks` : '/tracks';
            const response = await api.get(url);
            
            // Filter active vs processing if status is available
            // If API doesn't return status, assume all are active
            const allTracks = response.data;
            const activeTracks = allTracks.filter(t => !t.status || t.status === 'active');
            const processingTracks = allTracks.filter(t => t.status === 'processing' || t.status === 'pending');
            
            setTracks(activeTracks);
            setProcessingIds(new Set(processingTracks.map(t => t.id)));
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [activityId]);

    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

    const uploadTrack = async (file) => {
        if (!file) return;
        if (error) setError(null);

        // Clear previous failed upload for this file if retrying (logic can be more complex)
        // For now, just clear all failed uploads to keep it simple or manage by tempId if we had it
        // setFailedUploads(new Map()); 

        try {
            for await (const event of uploadTrackFile({ activityId, file })) {
                switch (event.type) {
                    case 'UPLOADING': {
                        const { tempId, file } = event.payload;
                        setUploadingFiles(prev => new Map(prev).set(tempId, file));
                        break;
                    }
                    case 'PROCESSING': {
                        const { tempId, trackId } = event.payload;

                        // A. Remove from Uploading
                        setUploadingFiles(prev => {
                            const next = new Map(prev);
                            next.delete(tempId);
                            return next;
                        });

                        // B. Add to Processing
                        setProcessingIds(prev => {
                            const next = new Set(prev);
                            next.add(trackId);
                            return next;
                        });
                        break;
                    }
                    case 'FAILED': {
                        const { tempId, file, reason } = event.payload;
                        console.error(`Track upload failed: ${reason}`);
                        
                        setUploadingFiles(prev => {
                            const next = new Map(prev);
                            next.delete(tempId);
                            return next;
                        });
                        setFailedUploads(prev => new Map(prev).set(tempId, file));
                        break;
                    }
                    case 'DUPLICATE': {
                        const { tempId, file } = event.payload;
                        setUploadingFiles(prev => {
                            const next = new Map(prev);
                            next.delete(tempId);
                            return next;
                        });
                        return;
                    }
                }
            }
        } catch (err) {
            console.log('in catch', err)
            setError(err.message || 'An unexpected error occurred during upload');
        }
    };

    const deleteTrack = async (trackId) => {
        try {
            await api.delete(`/tracks/${trackId}`);
            setTracks((prev) => prev.filter((t) => t.id !== trackId));
            return true;
        } catch (err) {
            setError(err);
            return false;
        }
    };

    const updateTracksState = useCallback((updatedTracks) => {
        if (!updatedTracks || updatedTracks.length === 0) return;

        setTracks(prev => {
            // Merge updated tracks, replacing existing ones or adding new active ones
            const next = [...prev];
            updatedTracks.forEach(updated => {
                const index = next.findIndex(t => t.id === updated.id);
                if (index !== -1) {
                    next[index] = updated;
                } else if (updated.status === 'active') {
                    next.push(updated);
                }
            });
            return next;
        });

        setProcessingIds(prevIds => {
            const next = new Set(prevIds);
            updatedTracks.forEach(t => {
                if (t.status === 'active' || t.status === 'failed') {
                    next.delete(t.id);
                }
            });
            return next;
        });
    }, []);

    return { 
        tracks, 
        uploadingFiles, 
        processingIds: Array.from(processingIds), 
        failedUploads, 
        loading, 
        error, 
        fetchTracks, 
        uploadTrack, 
        deleteTrack,
        updateTracksState 
    };
};

export default useTracks;