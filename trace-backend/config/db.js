const knex = require('knex');

// Configuration uses environment variables defined in docker-compose.yml
const dbConfig = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
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