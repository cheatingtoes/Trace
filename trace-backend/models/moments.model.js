const db = require('../config/db');
const TABLE_NAME = 'moments';

const getAllMoments = () => {
    return db(TABLE_NAME).select('*');
};

const getMomentById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const createMoment = (moment) => {
    return db(TABLE_NAME).insert(moment);
}

module.exports = {
    getAllMoments,
    getMomentById,
    createMoment
};
