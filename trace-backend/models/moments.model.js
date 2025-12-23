const db = require('../config/db');
const TABLE_NAME = 'moments';

const getAllMoments = () => {
    return db(TABLE_NAME).select('*');
};

const getMomentById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const createMoment = (moment) => {
    return db(TABLE_NAME).insert(moment).returning('*');
}

const findDuplicateMoment = ({ activityId, name, fileSizeBytes }) => {
    return db(TABLE_NAME).where({ activityId, name, fileSizeBytes }).returning(['id', 's3Key']);
}

const confirmBatchUploads = (activityId, momentIds) => {
    return db(TABLE_NAME).whereIn('id', momentIds)
        .andWhere('activityId', activityId)
        .andWhere('status', 'pending')
        .update({ status: 'active' })
        .returning(['id', 'type', 's3Key']);
}

const updateMetadata = (momentId, meta) => {
    return db(TABLE_NAME).where('id', momentId).update({
        // Update the PostGIS geometry column with the GPS data
        geom: db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [meta.lon, meta.lat, meta.alt]),
        occuredAt: meta.capturedAt // Correct the timestamp to the actual photo time
    });
}


module.exports = {
    getAllMoments,
    getMomentById,
    createMoment,
    findDuplicateMoment,
    confirmBatchUploads,
    updateMetadata
};
