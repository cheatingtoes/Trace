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
            displayName: 'Cheeto',
            passwordHash: 'placeholder-hash-1',
        },
        {
            id: uuidv7(),
            email: 'libby@example.com',
            displayName: 'Cherry',
            passwordHash: 'placeholder-hash-2',
        }
  ]);
};
