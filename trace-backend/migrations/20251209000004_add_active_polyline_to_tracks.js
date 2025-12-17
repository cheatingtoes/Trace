exports.up = function(knex) {
  return knex.schema.table('tracks', function(table) {
    table.integer('active_polyline_id').unsigned().nullable();
    table.foreign('active_polyline_id').references('id').inTable('polylines').onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.table('tracks', function(table) {
    table.dropForeign('active_polyline_id');
    table.dropColumn('active_polyline_id');
  });
};