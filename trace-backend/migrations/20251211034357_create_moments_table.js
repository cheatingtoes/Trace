/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('moments', function(table) {
    table.uuid('id').primary();

    table.uuid('activity_id').unsigned().notNullable();
    table.foreign('activity_id').references('id').inTable('activities').onDelete('CASCADE');

    table.enum('status', ['pending', 'processing', 'active', 'failed']).defaultTo('pending').notNullable();
    table.string('name')
    table.bigInteger('file_size_bytes');
    table.string('storage_key');
    table.string('storage_thumb_key');
    table.string('storage_web_key');
    table.string('mime_type');

    // type, ENUM,"'image', 'video', 'note', 'audio'"
    table.enum('type', ['image', 'video', 'note', 'audio']).notNullable();

    // occured_at, TIMESTAMP, The master sort key. (Capture time).
    table.timestamp('occured_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // geom, GEOMETRY(Point), Location for the map pin.
    // Using 4326 as the SRID for standard geographic coordinates.
    table.specificType('geom', 'GEOMETRY(PointZ, 4326)');

    // mile_marker, NUMERIC, Calculated distance on trail.
    table.decimal('mile_marker');

    // thumbnail_url, VARCHAR, Optimized small image for the map (NULL for notes/audio).
    table.string('thumbnail_url');

    table.text('body');

    // metadata, JSONB, The Magic Column. Stores type-specific data.
    table.jsonb('metadata');

    table.timestamps(true, true);

    table.index(['activity_id', 'name', 'file_size_bytes', 'occured_at']);
  })
  // Add a spatial index for the geom column for fast location-based queries
  .then(() => knex.raw('CREATE INDEX moments_geom_idx ON moments USING GIST (geom)'));
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('moments');
};
