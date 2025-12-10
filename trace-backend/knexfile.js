require('dotenv').config();

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
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};