/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('federated_identities', function(table) {
    table.increments('id');
    table.uuid('user_id')
        .notNullable()
        .references('id').inTable('users')
        .onDelete('CASCADE');
    table.enum('provider', ['google', 'apple']).notNullable();
    table.string('provider_id').notNullable();

    // CONSTRAINT: A specific Google ID can only exist once
    table.unique(['provider', 'provider_id']);
    
    // CONSTRAINT: A user can only have ONE Google account linked
    // (Prevents confusion: "Which Google account did I use?")
    table.unique(['user_id', 'provider']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('federated_identities');
};
