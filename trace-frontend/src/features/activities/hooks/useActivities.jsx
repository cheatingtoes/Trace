import { useState, useEffect } from 'react';
import api from '../../../api/axios';

const useActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await api.get('/activities');
                setActivities(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const createActivity = async (activityData) => {
        try {
            const response = await api.post('/activities', activityData);
            console.log('createActivity@@response', response)
            setActivities((prevActivities) => [...prevActivities, response.data[0]]);
            return response.data[0];
        } catch (err) {
            setError(err);
            return null;
        }
    };

    return { activities, loading, error, createActivity };
};

export default useActivities;
