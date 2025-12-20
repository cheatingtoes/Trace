const knex = require('knex');
const config = require('../config');

// Configuration uses environment variables defined in docker-compose.yml
const dbConfig = {
    client: 'pg',
    connection: {
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.name,
        port: config.db.port,
    },
    // Ensures the PostGIS extension is installed on connection
    pool: {
        afterCreate: function (conn, done) {
            conn.query('CREATE EXTENSION IF NOT EXISTS postgis;', function (err) {
                done(err, conn);
            });
        }
    }
};

const db = knex(dbConfig);

// Helper function to verify connection
db.raw('SELECT 1')
  .then(() => console.log('PostgreSQL/PostGIS Connected successfully!'))
  .catch((err) => {
      console.error('PostgreSQL connection error:', err.message);
  });

module.exports = db;