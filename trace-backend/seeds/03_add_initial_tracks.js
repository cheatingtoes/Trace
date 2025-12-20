const { uuidv7 } = require('uuidv7');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('tracks').del()

  // user one
  const activityOne = await knex('activities').where({ name: 'PCT Trail' }).first();
  const activityTwo = await knex('activities').where({ name: 'Appalachian Trail' }).first();
  // user two
  const activityThree = await knex('activities').where({ name: 'High Sierras' }).first();

  if (!activityOne || !activityTwo || !activityThree) {
    throw new Error('Required activities not found. Ensure that activities seed has been run.');
  }

  await knex('tracks').insert([
    // for user 1 PCT
    {
        id: uuidv7(),
        activity_id: activityOne.id,
        name: 'PCT Yosemite National Park',
        description: 'trail - too does this need a description? maybe user facing but i think the name is enuf.',
    },
    {
        id: uuidv7(),
        activity_id: activityOne.id,
        name: 'OCT Samuel H. Boardman Corridor',
    },
    // for user 1 AT
    {
        id: uuidv7(),
        activity_id: activityOne.id,
        name: 'Appalachian Trail Virginia near McAfee Knob',
    },
    // for user 2 Sierras
    {
        id: uuidv7(),
        activity_id: activityThree.id,
        name: 'Sierras',
        description: 'hiking the high sierras',
    },
  ]);
};
