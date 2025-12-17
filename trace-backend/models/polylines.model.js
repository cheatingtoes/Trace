const db = require('../config/db');
const TABLE_NAME = 'polylines';

const getAllPolylines = () => {
    return db(TABLE_NAME).select('*');
};

const getPolylineById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const createPolyline = (polyline, trx) => {
    const queryBuilder = (trx || db);
    return queryBuilder(TABLE_NAME).insert(polyline);
}

module.exports = {
    getAllPolylines,
    getPolylineById,
    createPolyline
};