const db = require('../config/db');

const create = async (data) => {
    const [cluster] = await db('clusters').insert(data).returning('*');
    return cluster;
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

module.exports = {
    create,
    findById,
    update,
    remove,
};