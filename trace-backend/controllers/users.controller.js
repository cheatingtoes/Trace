const UserService = require('../services/users.service');

const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
}

const createUser = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const newUser = await UserService.createUser({ name, email });
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await UserService.login({ email, password });
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    login
}