const { uuidv7 } = require('uuidv7');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
    await knex('users').del()
    await knex('users').insert([
        {
            id: uuidv7(),
            email: 'etotheric@example.com',
            display_name: 'Cheeto',
            password_hash: 'placeholder-hash-1',
        },
        {
            id: uuidv7(),
            email: 'libby@example.com',
            display_name: 'Cherry',
            password_hash: 'placeholder-hash-2',
        }
  ]);
};
