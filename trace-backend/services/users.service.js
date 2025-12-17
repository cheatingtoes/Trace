const db = require('../config/db');
const UserModel = require('../models/users.model');

const getAllUsers = async () => {
    return UserModel.getAllUsers();
};

const getUserById = async (id) => {
    return UserModel.getUserById(id);
};

const createUser = async (userData) => {
    return UserModel.createUser(userData);
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};