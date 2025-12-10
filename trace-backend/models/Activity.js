const db = require('../config/db');

const TABLE_NAME = 'activities';

const Activity = {
  /**
   * Creates a new activity.
   * @param {object} activity - The activity object to create (e.g., { name, description, user_id }).
   * @returns {Promise<object>} The newly created activity.
   */
  create: (activity) => {
    return db(TABLE_NAME).insert(activity).returning('*').then(rows => rows[0]);
  },

  /**
   * Finds an activity by its ID.
   * @param {number} id - The ID of the activity to find.
   * @returns {Promise<object|undefined>} The found activity or undefined.
   */
  findById: (id) => {
    return db(TABLE_NAME).where({ id }).first();
  },

  /**
   * Finds all activities for a given user.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array<object>>} A list of activities.
   */
  findByUser: (userId) => {
    return db(TABLE_NAME).where({ user_id: userId }).select('*');
  },

  /**
   * Updates an activity's details.
   * @param {number} id - The ID of the activity to update.
   * @param {object} updates - An object with the fields to update.
   * @returns {Promise<object>} The updated activity.
   */
  update: (id, updates) => {
    return db(TABLE_NAME).where({ id }).update(updates).returning('*').then(rows => rows[0]);
  },

  /**
   * Deletes an activity by its ID.
   * @param {number} id - The ID of the activity to delete.
   * @returns {Promise<number>} The number of deleted rows.
   */
  delete: (id) => {
    return db(TABLE_NAME).where({ id }).del();
  },
};

module.exports = Activity;
