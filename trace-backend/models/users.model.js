const db = require('../config/db');
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
        .join('federated_identities', 'users.id', 'federated_identities.userId')
        .where('federated_identities.provider', provider)
        .andWhere('federated_identities.providerId', providerId)
        .select('users.*')
        .first();
}

const createLocalUser = async (id, email, passwordHash, name) => {
    const [user] = await db(TABLE_NAME).insert({
        id,
        email,
        displayName: name,
        passwordHash
    }).returning('*');
    return user;
}

const createOAuthUser = async ({ email, name, avatar, provider, providerId }) => {
    return db.transaction(async (trx) => {
        // Step A: Create the User Container
        const [user] = await trx('users')
            .insert({
                email,
                displayName: name,
                avatarUrl: avatar
            })
            .returning('*');

        // Step B: Create the Key
        await trx('federated_identities').insert({
            userId: user.id,
            provider,
            providerId: providerId
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
        userId: userId,
        provider,
        providerId: providerId
    });
}

const addRefreshToken = (userId, token) => {
    return db(TABLE_NAME)
        .where({ id: userId })
        .update({
            // Postgres: append to array
            refreshTokens: db.raw('array_append(??, ?)', ['refreshTokens', token])
        });
};

const removeRefreshToken = (userId, token) => {
    return db(TABLE_NAME)
        .where({ id: userId })
        .update({
            // Postgres: remove element from array
            refreshTokens: db.raw('array_remove(??, ?)', ['refreshTokens', token])
        });
};

const clearRefreshTokens = (userId) => {
    return db(TABLE_NAME)
        .where({ id: userId })
        .update({
            refreshTokens: '{}' // Reset to empty Postgres array
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