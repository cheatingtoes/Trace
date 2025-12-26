const db = require('../config/db');
const TABLE_NAME = 'tracks';

const getAllTracks = () => {
    return db(TABLE_NAME).select('*');
};

const getTrackById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const getTrackWithPolyline = (id) => {
    return db(TABLE_NAME)
        .leftJoin('polylines', 'tracks.activePolylineId', 'polylines.id')
        .where('tracks.id', id)
        .select(
            'tracks.*',
            db.raw('ST_AsGeoJSON(polylines.geom) as polyline')
        )
        .first();
};

const createTrack = (trackData, trx) => {
    const queryBuilder = (trx || db);
    return queryBuilder(TABLE_NAME).insert(trackData);
}

const deleteTrack = (id) => {
    return db(TABLE_NAME).where({ id }).del();
}

const getTracksByActivityId = (activityId) => {
    return db(TABLE_NAME)
        .leftJoin('polylines', 'tracks.activePolylineId', 'polylines.id')
        .where('tracks.activityId', activityId)
        .select(
            'tracks.*',
            db.raw('ST_AsGeoJSON(polylines.geom) as polyline')
        );
}

const deleteTracksByActivityId = (activityId) => {
    return db(TABLE_NAME).where({ activityId }).del();
}

const getTracksByIds = (ids) => {
    return db(TABLE_NAME)
        .leftJoin('polylines', 'tracks.activePolylineId', 'polylines.id')
        .whereIn('tracks.id', ids)
        .select(
            'tracks.*',
            db.raw('ST_AsGeoJSON(polylines.geom) as polyline')
        );
};

const updateStatus = (id, status) => {
    return db(TABLE_NAME).where({ id }).update({ status });
};

module.exports = {
    getAllTracks,
    getTrackById,
    getTrackWithPolyline,
    createTrack,
    deleteTrack,
    deleteTracksByActivityId,
    getTracksByActivityId,
    getTracksByIds,
    updateStatus
};