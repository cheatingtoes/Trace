/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary();
    table.timestamps(true, true);
    table.timestamp('last_login_at'); // maybe not needed/wanted

    table.string('email').unique().notNullable();
    table.string('display_name');
    table.string('avatar_url');
    table.string('password_hash');
    table.specificType('refresh_tokens', 'TEXT[]').defaultTo('{}');

    table.index('email');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
