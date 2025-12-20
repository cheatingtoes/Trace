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
            hashed_password: 'placeholder-hash-1',
            salt: 'placeholder-salt-1',
            auth_provider: 'email'
        },
        {
            id: uuidv7(),
            email: 'libby@example.com',
            display_name: 'Cherry',
            hashed_password: 'placeholder-hash-2',
            salt: 'placeholder-salt-2',
            auth_provider: 'email'
        }
  ]);
};
