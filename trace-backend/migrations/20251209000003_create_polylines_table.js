exports.up = function(knex) {
  return knex.schema.createTable('polylines', function(table) {
    table.uuid('id').primary();
    table.timestamps(true, true);
    table.specificType('geom', 'GEOMETRY(LineStringZ, 4326)').notNullable();
    table.text('source_url');
    table.text('source_type');   
    
    table.uuid('track_id').notNullable();
    table.foreign('track_id').references('id').inTable('tracks').onDelete('CASCADE');
    table.index('track_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('polylines');
};
