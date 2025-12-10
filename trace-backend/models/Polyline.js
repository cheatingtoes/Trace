const db = require('../config/db');

const TABLE_NAME = 'polylines';

const Polyline = {
  /**
   * Creates a new polyline.
   * For the 'geom' field, you must use a PostGIS function like db.raw('ST_GeomFromText(...)').
   * @param {object} polyline - The polyline object to create (e.g., { route_id, source_url, geom }).
   * @returns {Promise<object>} The newly created polyline.
   */
  create: (polyline) => {
    return db(TABLE_NAME).insert(polyline).returning('*').then(rows => rows[0]);
  },

  /**
   * Finds a polyline by its ID.
   * @param {number} id - The ID of the polyline to find.
   * @returns {Promise<object|undefined>} The found polyline or undefined.
   */
  findById: (id) => {
    return db(TABLE_NAME).where({ id }).first();
  },

  /**
   * Finds all polylines for a given route.
   * @param {number} routeId - The ID of the route.
   * @returns {Promise<Array<object>>} A list of polylines.
   */
  findByRoute: (routeId) => {
    return db(TABLE_NAME).where({ route_id: routeId }).select('*');
  },

  /**
   * Deletes a polyline by its ID.
   * @param {number} id - The ID of the polyline to delete.
   * @returns {Promise<number>} The number of deleted rows.
   */
  delete: (id) => {
    return db(TABLE_NAME).where({ id }).del();
  },
};

module.exports = Polyline;
