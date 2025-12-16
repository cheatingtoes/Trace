/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('moments', function(table) {
    table.bigIncrements('id').primary();

    table.integer('activity_id').unsigned().notNullable();
    table.foreign('activity_id').references('id').inTable('activities').onDelete('CASCADE');

    // type, ENUM,"'photo', 'video', 'note', 'audio'"
    table.enum('type', ['photo', 'video', 'note', 'audio']).notNullable();

    // timestamp, TIMESTAMP, The master sort key. (Capture time).
    table.timestamp('timestamp').notNullable();

    // geom, GEOMETRY(Point), Location for the map pin.
    // Using 4326 as the SRID for standard geographic coordinates.
    table.specificType('geom', 'GEOMETRY(PointZ, 4326)');

    // mile_marker, NUMERIC, Calculated distance on trail.
    table.decimal('mile_marker');

    // media_url, VARCHAR, S3 URL for the photo/video/audio file (NULL for notes).
    table.string('media_url');

    // thumbnail_url, VARCHAR, Optimized small image for the map (NULL for notes/audio).
    table.string('thumbnail_url');

    // text_content, TEXT,"The body text for a Note, or the caption for a Photo."
    table.text('text_content');

    // metadata, JSONB, The Magic Column. Stores type-specific data.
    table.jsonb('metadata');

    // Add default created_at and updated_at
    table.timestamps(true, true);

    // Add indexes for performance
    table.index('activity_id');
    table.index('timestamp');
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
