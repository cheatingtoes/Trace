exports.up = function(knex) {
  return knex.schema.createTable('polylines', function(table) {
    table.increments('id').primary();
    table.uuid('uuid').defaultTo(knex.raw('gen_random_uuid()')).notNullable().unique();
    table.timestamps(true, true);
    table.specificType('geom', 'GEOMETRY(LineStringZ, 4326)').notNullable();
    table.text('source_url');
    table.text('source_type');   
    
    table.integer('track_id').unsigned().notNullable();
    table.foreign('track_id').references('id').inTable('tracks').onDelete('CASCADE');
    table.index('track_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('polylines');
};
