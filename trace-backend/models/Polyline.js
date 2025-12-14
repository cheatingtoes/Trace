const db = require('../config/db');

const TABLE_NAME = 'polylines';

const Polyline = {
  /**
   * Creates a new polyline.
   * For the 'geom' field, you must use a PostGIS function like db.raw('ST_GeomFromText(...)').
   * @param {object} polyline - The polyline object to create (e.g., { route_id, source_url, geom }).
   * @returns {Promise<object>} The newly created polyline.
   */
  create: (polylineData) => {
    const { geojson, ...rest } = polylineData;
    const geom = db.raw('ST_GeomFromGeoJSON(?)', [JSON.stringify(geojson)]);
    
    const dataToInsert = {
      ...rest,
      geom
    };

    return db(TABLE_NAME).insert(dataToInsert).returning('*').then(rows => rows[0]);
  },

  /**
   * Finds all polyline by its ID.
   * @param {number} id - The ID of the polyline to find.
   * @returns {Promise<object|undefined>} The found polyline or undefined.
   */
  findAll: (id) => {
    return db(TABLE_NAME).select('*');
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
   * Finds a polyline by its ID and returns its geom as a geometry object.
   * @param {number} id - The ID of the polyline to find.
   * @returns {Promise<object|undefined>} The found polyline or undefined.
   */
  findByIdAsGeoJSON: async (id) => {
    const row = await db('polylines')
      .where({ id })
      // 1. Simplify the geometry first (0.0001 is the tolerance in degrees ~10 meters)
      // 2. Convert the SIMPLIFIED version to GeoJSON
      .select('id', 'route_id', db.raw('ST_AsGeoJSON(ST_Simplify(geom, 0.0001)) as geometry_json'))
      .first();

    if (!row) return null;
    return {
      ...row,
      geometry: JSON.parse(row.geometry_json)
    }
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

  /**
   * Gets a polyline with GeoJSoN geometry.
   * @param {number} id - The ID of the polyline to delete.
   * @returns {Promise<number>} The number of deleted rows.
   */
  getGeoJSON: (id) => {
    return db(TABLE_NAME).where({ id }).del();
  },
};



module.exports = Polyline;
