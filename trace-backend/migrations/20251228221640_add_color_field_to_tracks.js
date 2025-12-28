/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('tracks', function(table) {
        // 7 chars is perfect for '#ffffff'
        // Default to a safe color (e.g., Trace Blue or Gray)
        table.string('color', 7).defaultTo('#2563eb'); 
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('tracks', function(table) {
        table.dropColumn('color');
    });
};
