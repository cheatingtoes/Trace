exports.up = function(knex) {
  return knex.schema.createTable('activities', function(table) {
    table.increments('id').primary();
    table.uuid('uuid').defaultTo(knex.raw('gen_random_uuid()')).notNullable().unique();
    table.string('name').notNullable();
    table.text('description');
    table.timestamps(true, true);

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index('user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('activities');
};
