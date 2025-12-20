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

const findDuplicateMoment = ({ activity_id, name, file_size_bytes }) => {
    return db(TABLE_NAME).where({ activity_id, name, file_size_bytes }).returning(['id', 's3_key']);
}

const confirmBatchUploads = (activityId, momentIds) => {
    return db(TABLE_NAME).whereIn('id', momentIds)
        .andWhere('activity_id', activityId)
        .andWhere('status', 'pending')
        .update({ status: 'active' })
        .returning(['id', 'type', 's3_key']);
}

const updateMetadata = (momentId, meta) => {
    return db(TABLE_NAME).where('id', momentId).update({
        // Update the PostGIS geometry column with the GPS data
        geom: db.raw('ST_SetSRID(ST_MakePoint(?, ?, ?), 4326)', [meta.lon, meta.lat, meta.alt]),
        occured_at: meta.capturedAt // Correct the timestamp to the actual photo time
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
