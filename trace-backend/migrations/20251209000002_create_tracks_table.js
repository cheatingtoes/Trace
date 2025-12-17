/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tracks', table => {
    table.increments('id').primary();
    table.uuid('uuid').defaultTo(knex.raw('gen_random_uuid()')).notNullable().unique();
    table.timestamps(true, true);
    table.string('name').notNullable();
    table.text('description');
    
    table.integer('activity_id').unsigned().notNullable();
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
