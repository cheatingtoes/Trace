const db = require('../config/db');

const TABLE_NAME = 'tracks';

const Track = {
  /**
   * Creates a new track.
   * @param {object} track - The track object to create (e.g., { name, description, activity_id }).
   * @returns {Promise<object>} The newly created track.
   */
  create: (track) => {
    return db(TABLE_NAME).insert(track).returning('*').then(rows => rows[0]);
  },

  /**
   * Finds a track by its ID.
   * @param {number} id - The ID of the track to find.
   * @returns {Promise<object|undefined>} The found track or undefined.
   */
  findById: (id) => {
    return db(TABLE_NAME).where({ id }).first();
  },

  /**
   * Finds all tracks for a given activity.
   * @param {number} activityId - The ID of the activity.
   * @returns {Promise<Array<object>>} A list of tracks.
   */
  findByActivity: (activityId) => {
    return db(TABLE_NAME).where({ activity_id: activityId }).select('*');
  },

  /**
   * Updates a track's details.
   * @param {number} id - The ID of the track to update.
   * @param {object} updates - An object with the fields to update (e.g., { name, description, active_polyline_id }).
   * @returns {Promise<object>} The updated track.
   */
  update: (id, updates) => {
    return db(TABLE_NAME).where({ id }).update(updates).returning('*').then(rows => rows[0]);
  },

  /**
   * Deletes a track by its ID.
   * @param {number} id - The ID of the track to delete.
   * @returns {Promise<number>} The number of deleted rows.
   */
  delete: (id) => {
    return db(TABLE_NAME).where({ id }).del();
  },
};

module.exports = Track;
