const { uuidv7 } = require('uuidv7');
const bcrypt = require('bcryptjs');
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
    const id = uuidv7();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return UserModel.createLocalUser(id, email, hashedPassword, name);
};

const removeRefreshToken = async (userId, refreshToken) => {
    return UserModel.removeRefreshToken(userId, refreshToken);
};

const verifyPassword = async (passwordHash, plainPassword) => {
    if (!passwordHash || !plainPassword) return false;
    return bcrypt.compare(plainPassword, passwordHash);
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