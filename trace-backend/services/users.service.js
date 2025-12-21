const { uuidv7 } = require('uuidv7');
const UserModel = require('../models/users.model');
const { BadRequestErrorUnauthorizedError, InternalServerError } = require('../errors/customErrors');


const getAllUsers = async () => {
    return UserModel.getAllUsers();
};

const getUserById = async (id) => {
    return UserModel.getUserById(id);
};

const createUser = async (userData) => {
    return UserModel.createLocalUser(userData);
};

const createOAuthUser = async (userData) => {
    return UserModel.createOAuthUser(userData);
};

const findByEmail = async (email) => {
    return UserModel.findByEmail(email);
};

const findByProvider = async (provider, providerId) => {
    return UserModel.findByProvider(provider, providerId);
};

const addRefreshToken = async (userId, refreshToken) => {
    return UserModel.addRefreshToken(userId, refreshToken);
};

const createLocalUser = async (email, password, name) => {
    return UserModel.createLocalUser(email, password, name);
};

const removeRefreshToken = async (userId, refreshToken) => {
    return UserModel.removeRefreshToken(userId, refreshToken);
};

const verifyPassword = async (passwordHash, plainPassword) => {
    if (!user.password_hash || !plainPassword) return false;
    return bcrypt.compare(plainPassword, password_hash);
};

const linkProvider = async ({ userId, provider, providerId }) => {
    return UserModel.linkProvider({ userId, provider, providerId });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  createOAuthUser,
  findByEmail,
  findByProvider,
  addRefreshToken,
  createLocalUser,
  removeRefreshToken,
  verifyPassword
};