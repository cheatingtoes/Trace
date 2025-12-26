const db = require('../config/db');
const TABLE_NAME = 'moments';

const getAllMoments = () => {
    return db(TABLE_NAME).select('*');
};

const getMomentById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const getMomentsByActivityId = (activityId) => {
    return db(TABLE_NAME).where({ activityId }).whereIn('status', ['active', 'processing']).select('*');
}

const createMoment = (moment) => {
    return db(TABLE_NAME).insert(moment).returning('*');
}

const deleteMoment = (id) => {
    return db(TABLE_NAME).where({ id }).del();
}

const findDuplicateMoment = ({ activityId, name, fileSizeBytes }) => {
    return db(TABLE_NAME).where({ activityId, name, fileSizeBytes }).returning(['id', 's3Key']);
}

const confirmBatchUploads = (activityId, momentIds) => {
    return db(TABLE_NAME).whereIn('id', momentIds)
        .andWhere('activityId', activityId)
        .andWhere('status', 'pending')
        .update({ status: 'processing' })
        .returning(['id', 'type', 's3Key']);
}

const updateMetadata = (momentId, meta) => {
    return db(TABLE_NAME).where('id', momentId).update({
        // Update the PostGIS geometry column with the GPS data
        geom: db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [meta.lon, meta.lat, meta.alt]),
        occuredAt: meta.capturedAt // Correct the timestamp to the actual photo time
    });
}

const updateStatus = (momentId, status) => {
    return db(TABLE_NAME).where('id', momentId).update({ status });
}

module.exports = {
    getAllMoments,
    getMomentById,
    getMomentsByActivityId,
    createMoment,
    deleteMoment,
    findDuplicateMoment,
    confirmBatchUploads,
    updateMetadata,
    updateStatus
};
