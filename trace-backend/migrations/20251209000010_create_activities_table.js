exports.up = function(knex) {
  return knex.schema.createTable('activities', function(table) {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.timestamp('start_date').nullable();
    table.timestamp('end_date').nullable();
    table.timestamps(true, true);

    table.uuid('user_id').notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index('user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('activities');
};
