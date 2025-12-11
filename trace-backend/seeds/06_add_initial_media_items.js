/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('media_items').del();

  // Get activities
  const pctActivity = await knex('activities').where({ name: 'PCT Trail' }).first();
  const atActivity = await knex('activities').where({ name: 'Appalachian Trail' }).first();
  const sierrasActivity = await knex('activities').where({ name: 'High Sierras' }).first();

  if (!pctActivity || !atActivity || !sierrasActivity) {
    throw new Error('Required activities not found. Ensure that the activities seed has been run.');
  }

  // Get routes
  const pctRoute = await knex('routes').where({ name: 'PCT Yosemite National Park' }).first();
  const octRoute = await knex('routes').where({ name: 'OCT Samuel H. Boardman Corridor' }).first();
  const atRoute = await knex('routes').where({ name: 'Appalachian Trail Virginia near McAfee Knob' }).first();
  const sierrasRoute = await knex('routes').where({ name: 'Sierras' }).first();

  if (!pctRoute || !octRoute || !atRoute || !sierrasRoute) {
    throw new Error('Required routes not found. Ensure that the routes seed has been run.');
  }

  const routesAndActivities = [
    { route: atRoute, activity: atActivity },
    { route: pctRoute, activity: pctActivity },
    // OCT photos will be associated with the PCT activity as the PCT runs through Oregon.
    { route: octRoute, activity: pctActivity },
    { route: sierrasRoute, activity: sierrasActivity },
  ];

  const mediaItems = [];
  const photosPerRoute = 20;

  routesAndActivities.forEach(({ route, activity }) => {
    for (let i = 0; i < photosPerRoute; i++) {
      const fraction = photosPerRoute > 1 ? i / (photosPerRoute - 1) : 0; // interpolates from 0.0 to 1.0
      mediaItems.push({
        activity_id: activity.id,
        type: 'photo',
        timestamp: new Date(),
        // Use ST_LineInterpolatePoint to find a point along the polyline and explicitly set SRID.
        geom: knex.raw('ST_SetSRID(ST_LineInterpolatePoint((SELECT geom FROM polylines WHERE id = ?), ?), 4326)', [route.active_polyline_id, fraction]),
        mile_marker: Math.random() * 20, // Placeholder mile marker
        media_url: `https://picsum.photos/seed/${activity.id}${route.id}${i}/800/600`,
        thumbnail_url: `https://picsum.photos/seed/${activity.id}${route.id}${i}/200/150`,
        text_content: `A photo from the ${route.name}.`,
        metadata: {
          camera: 'Virtual Camera',
        },
      });
    }
  });

  // Insert all media items in a single batch
  if (mediaItems.length > 0) {
    await knex.batchInsert('media_items', mediaItems);
  }
};