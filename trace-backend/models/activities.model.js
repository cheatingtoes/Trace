const db = require('../config/db');
const TABLE_NAME = 'activities';

const getAllActivities = () => {
    return db(TABLE_NAME).select('*');
};

const getActivityById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const createActivity = (activity) => {
    return db(TABLE_NAME).insert(activity);
}

module.exports = {
    getAllActivities,
    getActivityById,
    createActivity
};
