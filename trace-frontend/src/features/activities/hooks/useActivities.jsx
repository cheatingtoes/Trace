import { useState, useEffect } from 'react';
import api from '../../../api/axios';

const useActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await api.get('/activities');
            setActivities(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const createActivity = async (activityData) => {
        try {
            const response = await api.post('/activities', activityData);
            setActivities(prevActivities => [response.data, ...prevActivities])
            return response.data;
        } catch (err) {
            setError(err);
            return null;
        }
    };

    return { activities, loading, error, createActivity, fetchActivities };
};

export default useActivities;
