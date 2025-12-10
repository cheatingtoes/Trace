const db = require('../config/db');

const TABLE_NAME = 'routes';

const Route = {
  /**
   * Creates a new route.
   * @param {object} route - The route object to create (e.g., { name, description, activity_id }).
   * @returns {Promise<object>} The newly created route.
   */
  create: (route) => {
    return db(TABLE_NAME).insert(route).returning('*').then(rows => rows[0]);
  },

  /**
   * Finds a route by its ID.
   * @param {number} id - The ID of the route to find.
   * @returns {Promise<object|undefined>} The found route or undefined.
   */
  findById: (id) => {
    return db(TABLE_NAME).where({ id }).first();
  },

  /**
   * Finds all routes for a given activity.
   * @param {number} activityId - The ID of the activity.
   * @returns {Promise<Array<object>>} A list of routes.
   */
  findByActivity: (activityId) => {
    return db(TABLE_NAME).where({ activity_id: activityId }).select('*');
  },

  /**
   * Updates a route's details.
   * @param {number} id - The ID of the route to update.
   * @param {object} updates - An object with the fields to update (e.g., { name, description, active_polyline_id }).
   * @returns {Promise<object>} The updated route.
   */
  update: (id, updates) => {
    return db(TABLE_NAME).where({ id }).update(updates).returning('*').then(rows => rows[0]);
  },

  /**
   * Deletes a route by its ID.
   * @param {number} id - The ID of the route to delete.
   * @returns {Promise<number>} The number of deleted rows.
   */
  delete: (id) => {
    return db(TABLE_NAME).where({ id }).del();
  },
};

module.exports = Route;
