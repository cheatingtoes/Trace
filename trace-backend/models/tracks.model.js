const db = require('../config/db');
const TABLE_NAME = 'tracks';

const getAllTracks = () => {
    return db(TABLE_NAME).select('*');
};

const getTracksById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const createTrack = (trackData, trx) => {
    const queryBuilder = (trx || db);
    return queryBuilder(TABLE_NAME).insert(trackData);
}

module.exports = {
    getAllTracks,
    getTracksById,
    createTrack
};