import useStatusPoller from '../../../hooks/useStatusPoller';

/**
 * Polls a batch of moment IDs to check for status updates.
 *
 * @param {string[]} momentIds - An array of moment IDs to poll for status changes.
 * @param {function} onUpdate - Callback function executed with the array of updated moments from the server.
 * @param {number} [interval=3000] - The polling interval in milliseconds.
 */
const useMomentPoller = (momentIds, onUpdate, interval = 3000) => {
    useStatusPoller('/moments/status-batch', momentIds, onUpdate, interval);
};

export default useMomentPoller;
