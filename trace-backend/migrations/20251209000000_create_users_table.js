/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary();
    table.timestamps(true, true);
    table.timestamp('last_login_at');

    table.string('auth_provider');
    table.string('email').unique().notNullable();
    table.string('hashed_password');
    table.string('salt');
    table.string('sso_id');

    table.string('display_name');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
