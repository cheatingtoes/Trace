/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    const PCTTrack = await knex('tracks').where({ name: 'PCT Yosemite National Park' }).first();
    const OCTTrack = await knex('tracks').where({ name: 'OCT Samuel H. Boardman Corridor' }).first();
    const ATTrack = await knex('tracks').where({ name: 'Appalachian Trail Virginia near McAfee Knob' }).first();
    const sierrasTrack = await knex('tracks').where({ name: 'Sierras' }).first();

    if (!PCTTrack || !OCTTrack || !ATTrack || !sierrasTrack) {
      throw new Error('Required tracks not found. Ensure that tracks seed has been run.');
    }

    const ATPolyline = await knex('polylines').where({ track_id: ATTrack.id }).first();
    const PCTPolyline = await knex('polylines').where({ track_id: PCTTrack.id }).first();
    const OCTPolyline = await knex('polylines').where({ track_id: OCTTrack.id }).first();
    const sierrasPolyline = await knex('polylines').where({ track_id: sierrasTrack.id }).first();

    if (!ATPolyline || !PCTPolyline || !OCTPolyline || !sierrasPolyline) {
      throw new Error('Required polylines not found. Ensure that polylines seed has been run.');
    }

    // Update tracks to link to one of their polylines
    await knex('tracks')
      .where({ id: ATTrack.id })
      .update({ active_polyline_id: ATPolyline.id });

    await knex('tracks')
      .where({ id: PCTTrack.id })
      .update({ active_polyline_id: PCTPolyline.id });

    await knex('tracks')
      .where({ id: OCTTrack.id })
      .update({ active_polyline_id: OCTPolyline.id });

    await knex('tracks')
      .where({ id: sierrasTrack.id })
      .update({ active_polyline_id: sierrasPolyline.id });
};
