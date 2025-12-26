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

const deleteTrack = (id) => {
    return db(TABLE_NAME).where({ id }).del();
}

const getTracksByActivityId = (activityId) => {
    return db(TABLE_NAME).where({ activityId: activityId }).select('*');
}

module.exports = {
    getAllTracks,
    getTrackById,
    createTrack,
    deleteTrack,
    getTracksByActivityId
};