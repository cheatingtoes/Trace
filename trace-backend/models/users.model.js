const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { uuidv7 } = require('uuidv7');
const TABLE_NAME = 'users';

const getAllUsers = () => {
    return db(TABLE_NAME).select('*');
};

const getUserById = (id) => {
    return db(TABLE_NAME).where({ id }).first();
};

const findByEmail = (email) => {
    return db(TABLE_NAME).where({ email }).first();
}

const findByProvider = (provider, providerId) => {
    return db(TABLE_NAME)
        .join('federated_identities', 'users.id', 'federated_identities.user_id')
        .where('federated_identities.provider', provider)
        .andWhere('federated_identities.provider_id', providerId)
        .select('users.*')
        .first();
}

const createLocalUser = async (email, password, name) => {
    const id = uuidv7();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [user] = await db(TABLE_NAME).insert({
        id,
        email,
        display_name: name,
        password_hash: hashedPassword
    }).returning('*');
    return user;
}

const createOAuthUser = async ({ email, name, avatar, provider, providerId }) => {
    return db.transaction(async (trx) => {
        // Step A: Create the User Container
        const [user] = await trx('users')
            .insert({
                email,
                display_name: name,
                avatar_url: avatar
            })
            .returning('*');

        // Step B: Create the Key
        await trx('federated_identities').insert({
            user_id: user.id,
            provider,
            provider_id: providerId
        });

        return user;
    });
}

/**
 * Link a provider to an existing user.
 * Usage: User is logged in, clicks "Connect Google"
 */
const linkProvider = ({ userId, provider, providerId }) => {
    return db('federated_identities').insert({
        user_id: userId,
        provider,
        provider_id: providerId
    });
}

const addRefreshToken = (userId, token) => {
    return db(TABLE_NAME)
        .where({ id: userId })
        .update({
            // Postgres: append to array
            refresh_tokens: db.raw('array_append(refresh_tokens, ?)', [token])
        });
};

const removeRefreshToken = (userId, token) => {
    return db(TABLE_NAME)
        .where({ id: userId })
        .update({
            // Postgres: remove element from array
            refresh_tokens: db.raw('array_remove(refresh_tokens, ?)', [token])
        });
};

const clearRefreshTokens = (userId) => {
    return db(TABLE_NAME)
        .where({ id: userId })
        .update({
            refresh_tokens: '{}' // Reset to empty Postgres array
        });
};

module.exports = {
    getAllUsers,
    getUserById,
    findByEmail,
    findByProvider,
    createLocalUser,
    createOAuthUser,
    linkProvider,
    addRefreshToken,
    removeRefreshToken,
    clearRefreshTokens
};