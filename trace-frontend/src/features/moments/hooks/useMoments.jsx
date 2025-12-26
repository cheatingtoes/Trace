import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import { uploadMomentFiles } from './momentUploader';

// handles fetching moments, uploading moments -> status update + polling
// batch update, batch deletes, batch creates
const useMoments = (activityId = null) => {
    const [moments, setMoments] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(new Map()); // Map<tempId, File>
    const [processingIds, setProcessingIds] = useState(new Set());   // Set<momentId>
    const [failedUploads, setFailedUploads] = useState(new Map());  // Map<tempId, File>
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMoments = useCallback(async () => {
        setLoading(true);
        if (!activityId) return setError('Activity ID is required for fetching moments.');
        try {
            const response = await api.get(`/activities/${activityId}/moments`);
            const activeMoments = response.data.filter(m => m.status === 'active');
            const processingMoments = response.data.filter(m => m.status === 'processing');
            setMoments(activeMoments);
            setProcessingIds(new Set(processingMoments.map(m => m.id)));
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [activityId]);

    useEffect(() => {
        fetchMoments();
    }, [fetchMoments]);

    /**
     * Consumes the `uploadMomentFiles` async generator to orchestrate uploads
     * and update the component's state based on yielded events.
     */
    const uploadMoments = async (filesInput) => {
        if (error) setError(null);
        setLoading(true);

        if (filesInput instanceof Map) {
             setFailedUploads(prev => {
                const next = new Map(prev);
                for (const id of filesInput.keys()) next.delete(id);
                return next;
             });
        }

        try {
            for await (const event of uploadMomentFiles({ activityId, filesInput })) {
                switch (event.type) {
                    case 'UPLOADING': {
                        const { tempId, file } = event.payload;
                        setUploadingFiles(prev => new Map(prev).set(tempId, file));
                        // const tempMoment = { id: tempId, name: file.name, status: 'uploading' };
                        // setMoments(prev => [...prev, tempMoment]);
                        break;
                    }
                    case 'PROCESSING': {
                        // A. Remove from Uploading
                        setUploadingFiles(prev => {
                            const next = new Map(prev);
                            next.delete(tempId);
                            return next;
                        });

                        // B. Add to Processing (For Poller)
                        setProcessingIds(prev => {
                            const next = new Set(prev);
                            next.add(moment.id);
                            return next;
                        });
                        break;
                    }
                    case 'FAILED': {
                        const { tempId, file, reason } = event.payload;
                        console.error(`Upload failed: ${reason}`);
                        
                        // Move from Uploading -> Failed
                        setUploadingFiles(prev => {
                            const next = new Map(prev);
                            next.delete(tempId);
                            return next;
                        });
                        setFailedUploads(prev => new Map(prev).set(tempId, file));
                        break;
                    }
                }
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const deleteMoment = async (momentId) => {
        try {
            await api.delete(`/moments/${momentId}`);
            setMoments((prev) => prev.filter((m) => m.id !== momentId));
            return true;
        } catch (err) {
            setError(err);
            return false;
        }
    };

    const updateMoment = async (momentId, updates) => {
        try {
            const response = await api.patch(`/moments/${momentId}`, updates);
            setMoments((prev) => prev.map((m) => (m.id === momentId ? response.data : m)));
            return response.data;
        } catch (err) {
            setError(err);
            return null;
        }
    };

    // for polling
    const updateMomentsState = useCallback((updatedMoments) => {
        if (!updatedMoments || updatedMoments.length === 0) return;

        setMoments(prevMoments => {
            const updatesMap = new Map(updatedMoments.map(m => [m.id, m]));
            return prevMoments.map(m => {
                const update = updatesMap.get(m.id);
                return update ? { ...m, ...update } : m;
            });
        });
    }, []);

    return { moments, failedUploads, loading, error, fetchMoments, uploadMoments, deleteMoment, updateMoment, updateMomentsState };
};

export default useMoments;