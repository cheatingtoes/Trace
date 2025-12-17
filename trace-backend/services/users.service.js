const db = require('../config/db');
const User = require('../models/User');
const UserModel = require('../models/user.model');

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