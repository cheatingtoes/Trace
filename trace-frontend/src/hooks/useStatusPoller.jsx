import { useEffect, useRef } from 'react';
import api from '../api/axios';

/**
 * Polls a batch of entity IDs to check for status updates.
 *
 * @param {string} endpoint - The API endpoint to poll (e.g., '/moments/status-batch').
 * @param {string[]} ids - An array of entity IDs to poll.
 * @param {function} onUpdate - Callback function executed with the array of updated entities.
 * @param {number} [interval=3000] - The polling interval in milliseconds.
 */
const useStatusPoller = (endpoint, ids, onUpdate, interval = 3000) => {
    const intervalRef = useRef(null);
    const onUpdateRef = useRef(onUpdate);

    // Keep the onUpdate callback fresh without re-triggering the effect.
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    // Serialize IDs to avoid resetting the interval on every render if the array reference changes but content is the same
    const serializedIds = JSON.stringify(ids ? [...ids].sort() : []);

    useEffect(() => {
        // If there are no IDs to poll or no endpoint, clear any existing interval and stop.
        if (!serializedIds || serializedIds === '[]' || !endpoint) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const idsToPoll = JSON.parse(serializedIds);
        const pollStatuses = async () => {
            try {
                const response = await api.post(endpoint, { ids: idsToPoll });
                const updatedEntities = response.data || [];

                if (updatedEntities && updatedEntities.length > 0) {
                    onUpdateRef.current(updatedEntities);
                }
            } catch (error) {
                console.error(`Poller request to ${endpoint} failed:`, error);
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };

        // Clear previous interval and start a new one.
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(pollStatuses, interval);

        // Cleanup on unmount or when dependencies change.
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };

    }, [serializedIds, interval, endpoint]);
};

export default useStatusPoller;
