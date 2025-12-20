const { uuidv7 } = require('uuidv7');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const UserModel = require('../models/users.model');
const { UnauthorizedError, InternalServerError } = require('../errors/customErrors');


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

const login = async ({ email, password}) => {
    const user = await UserModel.findByEmail(email);
    if (!user) {
        throw new UnauthorizedError('Invalid email or password.');
    }

    let isValidpassword = false;
    try {
        isValidpassword = await bcrypt.compare(password, user.password_hash);
    } catch (err) {
        throw new InternalServerError('Something went wrong during authentication.');
    }

    if (!isValidpassword) {
        throw new UnauthorizedError('Invalid email or password.');
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.auth.jwtSecret,
        { expiresIn: '7d' } 
    );

    return {
        userId: user.id,
        email: user.email,
        token: token
    };

}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  login,
};