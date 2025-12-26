/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('moments', function(table) {
        table.uuid('cluster_id')
            .nullable()
            .references('id')
            .inTable('clusters')
            .onDelete('SET NULL');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('moments', function(table) {
        table.dropColumn('cluster_id');
    });
};