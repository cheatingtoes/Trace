const { uuidv7 } = require('uuidv7');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
    await knex('activities').del()

    const userOne = await knex('users').where({ email: 'etotheric@example.com' }).first();
    const userTwo = await knex('users').where({ email: 'libby@example.com' }).first();

    if (!userOne || !userTwo) {
        throw new Error('Required users not found. Ensure that users seed has been run.');
    }

    await knex('activities').insert([
        {
            id: uuidv7(),
            user_id: userOne.id,
            name: 'PCT Trail',
            description: 'Yosemite National Park',
        },
        {
            id: uuidv7(),
            user_id: userOne.id,
            name: 'Appalachian Trail',
            description: '2024 thru hike! First time, well second time camping out.',
        },
        {
            id: uuidv7(),
            user_id: userTwo.id,
            name: 'High Sierras',
            description: 'Exploring the Sierra Nevada mountains',
        }
    ]);
};
