import { useEffect, useRef } from 'react';
import api from '../../../api/axios';

/**
 * Polls a batch of moment IDs to check for status updates, for example,
 * waiting for a 'processing' status to become 'active'.
 *
 * @param {string[]} momentIds - An array of moment IDs to poll for status changes.
 * @param {function} onUpdate - Callback function executed with the array of updated moments from the server.
 * @param {number} [interval=3000] - The polling interval in milliseconds.
 */
const useMomentPoller = (momentIds, onUpdate, interval = 3000) => {
    const intervalRef = useRef(null);
    const onUpdateRef = useRef(onUpdate);

    // Keep the onUpdate callback fresh without re-triggering the effect.
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    // Serialize IDs to avoid resetting the interval on every render if the array reference changes but content is the same
    const serializedIds = JSON.stringify(momentIds ? [...momentIds].sort() : []);

    useEffect(() => {
        // If there are no IDs to poll, clear any existing interval and stop.
        if (!serializedIds || serializedIds === '[]') {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const idsToPoll = JSON.parse(serializedIds);
        const pollStatuses = async () => {
            try {
                const response = await api.post('/moments/status-batch', { ids: idsToPoll });
                const updatedMoments = response.data || [];

                if (updatedMoments && updatedMoments.length > 0) {
                    onUpdateRef.current(updatedMoments);
                }
            } catch (error) {
                console.error('Moment poller request failed:', error);
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };

        // Clear previous interval and start a new one.
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(pollStatuses, interval);

        // Cleanup on unmount or when dependencies change.
        return () => clearInterval(intervalRef.current);

    }, [serializedIds, interval]); // Effect dependencies
};

export default useMomentPoller;