const db = require('../config/db');

const createCluster = (data) => {
    return db('clusters').insert(data).returning('*');
};

const findById = async (id) => {
    return db('clusters').where({ id }).first();
};

const update = async (id, data) => {
    const [cluster] = await db('clusters').where({ id }).update(data).returning('*');
    return cluster;
};

const remove = async (id) => {
    return db('clusters').where({ id }).del();
};

const findClusterForMoment = async (activityId, occuredAt) => {
    return db('clusters')
        .where({ activityId })
        .where('start_date', '<=', occuredAt)
        .where('end_date', '>=', occuredAt)
        .first();
};

module.exports = {
    createCluster,
    findById,
    update,
    remove,
    findClusterForMoment,
};