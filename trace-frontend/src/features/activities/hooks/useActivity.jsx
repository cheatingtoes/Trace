import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';

const useActivity = (activityId) => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActivity = useCallback(async () => {
        if (!activityId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/activities/${activityId}`);
            setActivity(response.data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [activityId]);

    useEffect(() => {
        fetchActivity();
    }, [fetchActivity]);

    const updateActivity = async (updatedData) => {
        try {
            const response = await api.put(`/activities/${activityId}`, updatedData);
            setActivity(response.data);
            return response.data;
        } catch (err) {
            console.error("Failed to update activity", err);
            setError(err);
            return null;
        }
    };

    return { activity, loading, error, fetchActivity, updateActivity };
};

export default useActivity;