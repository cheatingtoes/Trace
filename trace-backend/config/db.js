const knex = require('knex');
const knexConfig = require('../knexfile');
const environment = process.env.NODE_ENV || 'development';
const dbConfig = knexConfig[environment];

if (!dbConfig) {
    throw new Error(`Knex configuration for environment '${environment}' not found in knexfile.js`);
}

const db = knex(dbConfig);

// Helper function to verify connection
db.raw('SELECT 1')
  .then(() => console.log(`PostgreSQL/PostGIS connected successfully in '${environment}' environment!`))
  .catch((err) => {
      console.error('PostgreSQL connection error:', err.message);
  });

module.exports = db;