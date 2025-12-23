const db = require('../config/db');
const TABLE_NAME = 'activities';

const getAllActivities = () => {
    return db(TABLE_NAME).select('*');
};

const getActivitiesByUserId = (userId) => {
    return db(TABLE_NAME).where({ userId });
}

const getActivityById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const createActivity = (activity) => {
    return db(TABLE_NAME).insert(activity).returning('*');
}

const updateActivity = (id, activity) => {
    return db(TABLE_NAME).where({ id }).update(activity).returning('*');
}

const deleteActivity = (id) => {
    return db(TABLE_NAME).where({ id }).del();
}

module.exports = {
    getAllActivities,
    getActivitiesByUserId,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity
};
