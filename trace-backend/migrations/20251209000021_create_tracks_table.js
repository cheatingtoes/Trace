/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tracks', table => {
    table.uuid('id').primary();
    table.timestamps(true, true);
    table.string('name').notNullable();
    table.text('description');
    table.enum('status', ['pending', 'processing', 'active', 'failed']).defaultTo('pending').notNullable();
    
    table.uuid('activity_id').notNullable();
    table.foreign('activity_id').references('id').inTable('activities').onDelete('CASCADE');
    table.index('activity_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tracks');
};
