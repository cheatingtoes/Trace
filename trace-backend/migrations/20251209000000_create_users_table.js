/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.uuid('uuid').defaultTo(knex.raw('gen_random_uuid()')).notNullable().unique();
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
