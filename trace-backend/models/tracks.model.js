const db = require('../config/db');
const TABLE_NAME = 'tracks';

const getAllTracks = () => {
    return db(TABLE_NAME).select('*');
};

const getTrackById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const createTrack = (trackData, trx) => {
    const queryBuilder = (trx || db);
    return queryBuilder(TABLE_NAME).insert(trackData);
}

const getTracksByActivityId = (activityId) => {
    return db(TABLE_NAME).where({ activity_id: activityId }).select('*');
}

module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
    getTracksByActivityId
};