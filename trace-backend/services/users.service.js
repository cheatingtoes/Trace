const { uuidv7 } = require('uuidv7');
const UserModel = require('../models/users.model');

const getAllUsers = async () => {
    return UserModel.getAllUsers();
};

const getUserById = async (id) => {
    return UserModel.getUserById(id);
};

const createUser = async (userData) => {
    const id = uuidv7();
    return UserModel.createUser({ id, ...userData });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};