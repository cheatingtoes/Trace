const db = require('../config/db');
const TABLE_NAME = 'users';

const getAllUsers = () => {
    return db(TABLE_NAME).select('*');
};

const getUserById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const createUser = (user, trx) => {
    const queryBuilder = (trx || db);
    return queryBuilder(TABLE_NAME).insert(user);
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser
};