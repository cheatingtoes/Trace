/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    const PCTRoute = await knex('routes').where({ name: 'PCT Yosemite National Park' }).first();
    const OCTRoute = await knex('routes').where({ name: 'OCT Samuel H. Boardman Corridor' }).first();
    const ATRoute = await knex('routes').where({ name: 'Appalachian Trail Virginia near McAfee Knob' }).first();
    const sierrasRoute = await knex('routes').where({ name: 'Sierras' }).first();

    if (!PCTRoute || !OCTRoute || !ATRoute || !sierrasRoute) {
      throw new Error('Required routes not found. Ensure that routes seed has been run.');
    }

    const ATPolyline = await knex('polylines').where({ route_id: ATRoute.id }).first();
    const PCTPolyline = await knex('polylines').where({ route_id: PCTRoute.id }).first();
    const OCTPolyline = await knex('polylines').where({ route_id: OCTRoute.id }).first();
    const sierrasPolyline = await knex('polylines').where({ route_id: sierrasRoute.id }).first();

    if (!ATPolyline || !PCTPolyline || !OCTPolyline || !sierrasPolyline) {
      throw new Error('Required polylines not found. Ensure that polylines seed has been run.');
    }

    // Update routes to link to one of their polylines
    await knex('routes')
      .where({ id: ATRoute.id })
      .update({ active_polyline_id: ATPolyline.id });

    await knex('routes')
      .where({ id: PCTRoute.id })
      .update({ active_polyline_id: PCTPolyline.id });

    await knex('routes')
      .where({ id: OCTRoute.id })
      .update({ active_polyline_id: OCTPolyline.id });

    await knex('routes')
      .where({ id: sierrasRoute.id })
      .update({ active_polyline_id: sierrasPolyline.id });
};
