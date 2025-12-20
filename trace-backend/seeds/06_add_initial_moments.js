const { uuidv7 } = require('uuidv7');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('moments').del();

  // Get activities
  const pctActivity = await knex('activities').where({ name: 'PCT Trail' }).first();
  const atActivity = await knex('activities').where({ name: 'Appalachian Trail' }).first();
  const sierrasActivity = await knex('activities').where({ name: 'High Sierras' }).first();

  if (!pctActivity || !atActivity || !sierrasActivity) {
    throw new Error('Required activities not found. Ensure that the activities seed has been run.');
  }

  // Get tracks
  const pctTrack = await knex('tracks').where({ name: 'PCT Yosemite National Park' }).first();
  const octTrack = await knex('tracks').where({ name: 'OCT Samuel H. Boardman Corridor' }).first();
  const atTrack = await knex('tracks').where({ name: 'Appalachian Trail Virginia near McAfee Knob' }).first();
  const sierrasTrack = await knex('tracks').where({ name: 'Sierras' }).first();

  if (!pctTrack || !octTrack || !atTrack || !sierrasTrack) {
    throw new Error('Required tracks not found. Ensure that the tracks seed has been run.');
  }

  const tracksAndActivities = [
    { track: atTrack, activity: atActivity },
    { track: pctTrack, activity: pctActivity },
    // OCT photos will be associated with the PCT activity as the PCT runs through Oregon.
    { track: octTrack, activity: pctActivity },
    { track: sierrasTrack, activity: sierrasActivity },
  ];

  const moments = [];
  const photosPerTrack = 20;

  tracksAndActivities.forEach(({ track, activity }) => {
    for (let i = 0; i < photosPerTrack; i++) {
      const fraction = photosPerTrack > 1 ? i / (photosPerTrack - 1) : 0; // interpolates from 0.0 to 1.0
      moments.push({
        id: uuidv7(),
        activity_id: activity.id,
        status: 'pending',
        name: `photo_${i}.jpg`,
        file_size_bytes: Math.floor(Math.random() * (5000000 - 1000000 + 1) + 1000000),
        type: 'image',
        occured_at: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * 30), // random time in the last 30 days
        // Use ST_LineInterpolatePoint to find a point along the polyline and explicitly set SRID.
        geom: knex.raw('ST_SetSRID(ST_LineInterpolatePoint((SELECT geom FROM polylines WHERE id = ?), ?), 4326)', [track.active_polyline_id, fraction]),
        mile_marker: Math.random() * 20, // Placeholder mile marker
        media_url: `https://picsum.photos/seed/${activity.id}${track.id}${i}/800/600`,
        thumbnail_url: `https://picsum.photos/seed/${activity.id}${track.id}${i}/200/150`,
        body: `A photo from the ${track.name}.`,
        metadata: {
          camera: 'Virtual Camera',
        },
      });
    }
  });

  // Insert all media items in a single batch
  if (moments.length > 0) {
    await knex.batchInsert('moments', moments);
  }
};