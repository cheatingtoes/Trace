const { uuidv7 } = require('uuidv7');
const UserModel = require('../models/users.model');
const { UnauthorizedError, InternalServerError } = require('../errors/customErrors');


const getAllUsers = async () => {
    return UserModel.getAllUsers();
};

const getUserById = async (id) => {
    return UserModel.getUserById(id);
};

const createUser = async (userData) => {
    return UserModel.createLocalUser(userData);
};

const findByEmail = async (email) => {
    return UserModel.findByEmail(email);
};

const addRefreshToken = async (userId, refreshToken) => {
    return UserModel.addRefreshToken(userId, refreshToken);
};

const createLocalUser = async (email, password, name) => {
    return UserModel.createLocalUser({ email, password, name });
};

const removeRefreshToken = async (userId, refreshToken) => {
    return UserModel.removeRefreshToken(userId, refreshToken);
};


module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  findByEmail,
  addRefreshToken,
  createLocalUser,
  removeRefreshToken,
};