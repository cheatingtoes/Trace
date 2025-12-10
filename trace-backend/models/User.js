const db = require('../config/db');

const TABLE_NAME = 'users';

const User = {
  /**
   * Creates a new user.
   * @param {object} user - The user object to create.
   * @returns {Promise<object>} The newly created user.
   */
  create: (user) => {
    return db(TABLE_NAME).insert(user).returning('*').then(rows => rows[0]);
  },

  /**
   * Finds a user by their ID.
   * @param {number} id - The ID of the user to find.
   * @returns {Promise<object|undefined>} The found user or undefined.
   */
  findById: (id) => {
    return db(TABLE_NAME).where({ id }).first();
  },

  /**
   * Finds a user by their UUID.
   * @param {string} uuid - The UUID of the user to find.
   * @returns {Promise<object|undefined>} The found user or undefined.
   */
  findByUuid: (uuid) => {
    return db(TABLE_NAME).where({ uuid }).first();
  },

  /**
   * Finds a user by their email address.
   * @param {string} email - The email of the user to find.
   * @returns {Promise<object|undefined>} The found user or undefined.
   */
  findByEmail: (email) => {
    return db(TABLE_NAME).where({ email }).first();
  },

  /**
   * Updates a user's details.
   * @param {number} id - The ID of the user to update.
   * @param {object} updates - An object with the fields to update.
   * @returns {Promise<object>} The updated user.
   */
  update: (id, updates) => {
    return db(TABLE_NAME).where({ id }).update(updates).returning('*').then(rows => rows[0]);
  },

  /**
   * Deletes a user by their ID.
   * @param {number} id - The ID of the user to delete.
   * @returns {Promise<number>} The number of deleted rows.
   */
  delete: (id) => {
    return db(TABLE_NAME).where({ id }).del();
  },
};

module.exports = User;
