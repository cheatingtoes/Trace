import useStatusPoller from '../../../hooks/useStatusPoller';

/**
 * Polls a batch of track IDs to check for status updates.
 *
 * @param {string[]} trackIds - An array of track IDs to poll for status changes.
 * @param {function} onUpdate - Callback function executed with the array of updated tracks from the server.
 * @param {number} [interval=3000] - The polling interval in milliseconds.
 */
const useTrackPoller = (trackIds, onUpdate, interval = 3000) => {
    useStatusPoller('/tracks/status-batch', trackIds, onUpdate, interval);
};

export default useTrackPoller;
