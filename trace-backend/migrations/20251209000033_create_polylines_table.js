exports.up = function(knex) {
  return knex.schema.createTable('polylines', function(table) {
    table.uuid('id').primary();
    table.timestamps(true, true);
    table.specificType('geom', 'GEOMETRY(LineStringZ, 4326)');
    table.specificType('simplified_geom', 'GEOMETRY(LineStringZ, 4326)');
    table.text('storage_key');
    table.string('mime_type');
    table.bigInteger('file_size_bytes')   
    
    table.uuid('track_id').notNullable();
    table.foreign('track_id').references('id').inTable('tracks').onDelete('CASCADE');
    table.index('track_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('polylines');
};
