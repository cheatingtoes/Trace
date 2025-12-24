/**
 * Standard Success Response
 * @param {object | array} data - The payload
 * @param {object} meta - Pagination or extra metadata
 */
const success = (data, meta = null) => {
    return {
        success: true,
        data: data,
        meta: meta
    };
};

module.exports = { success };