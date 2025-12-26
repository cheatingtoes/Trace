/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('clusters', function(table) {
        table.uuid('id').primary();
        table.timestamps(true, true);

        table.string('name').notNullable().defaultTo('Untitled');
        table.text('description').nullable();
        table.timestamp('start_date').nullable();
        table.timestamp('end_date').nullable();
        table.specificType('geom', 'GEOMETRY(PointZ, 4326)').nullable();

        table.uuid('activity_id')
            .notNullable()
            .references('id')
            .inTable('activities')
            .onDelete('CASCADE');

        table.uuid('cover_moment_id')
            .nullable()
            .references('id')
            .inTable('moments')
            .onDelete('SET NULL');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('clusters');
};
