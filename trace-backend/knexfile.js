require('dotenv').config();
const { postProcessResponse, wrapIdentifier } = require('./utils/db-converters');
/**
 * @type { Object.<string, import('knex').Knex.Config> }
 */
module.exports = {
  // Use the same environment variables defined in your docker-compose.yml
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
    },
    postProcessResponse,
    wrapIdentifier,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    },
    pool: {
      afterCreate: function (conn, done) {
        conn.query('CREATE EXTENSION IF NOT EXISTS postgis;', function (err) {
          done(err, conn);
        });
      }
    },
  }
};