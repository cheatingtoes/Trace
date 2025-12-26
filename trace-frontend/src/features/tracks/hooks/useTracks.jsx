import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';

const useTracks = (activityId = null) => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTracks = useCallback(async () => {
        setLoading(true);
        try {
            const url = activityId ? `/activities/${activityId}/tracks` : '/tracks';
            const response = await api.get(url);
            setTracks(response.data);
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
        const formData = new FormData();
        formData.append('file', file);
        // Add activityId if your backend requires it in the body as well
        if (activityId) formData.append('activityId', activityId);

        try {
            const response = await api.post('tracks/upload-track-file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('useTracks upload response.data', response.data)
            setTracks((prev) => [...prev, response.data]);
            return response.data;
        } catch (err) {
            setError(err);
            return null;
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

    return { tracks, loading, error, fetchTracks, uploadTrack, deleteTrack };
};

export default useTracks;