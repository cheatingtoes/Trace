const { uuidv7 } = require('uuidv7');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('polylines').del()

    const PCTTrack = await knex('tracks').where({ name: 'PCT Yosemite National Park' }).first();
    const OCTTrack = await knex('tracks').where({ name: 'OCT Samuel H. Boardman Corridor' }).first();
    const ATTrack = await knex('tracks').where({ name: 'Appalachian Trail Virginia near McAfee Knob' }).first();
    const sierrasTrack = await knex('tracks').where({ name: 'Sierras' }).first();

    if (!PCTTrack || !OCTTrack || !ATTrack || !sierrasTrack) {
      throw new Error('Required tracks not found. Ensure that tracks seed has been run.');
    }
   
    // --- Appalachian Trail (segment in Virginia near McAfee Knob) ---
    const appalachianTrail_v1 = 'LINESTRING(-80.0831 37.3912, -80.0825 37.3918, -80.0819 37.3923, -80.0812 37.3929, -80.0805 37.3935, -80.0798 37.3941, -80.0791 37.3947, -80.0784 37.3953, -80.0777 37.3959, -80.0770 37.3965, -80.0763 37.3971, -80.0756 37.3977, -80.0749 37.3983, -80.0742 37.3989, -80.0735 37.3995, -80.0728 37.4001, -80.0721 37.4007, -80.0714 37.4013, -80.0707 37.4019, -80.0700 37.4025)';
    const appalachianTrail_v2 = 'LINESTRING(-80.0830 37.3913, -80.0824 37.3919, -80.0818 37.3924, -80.0811 37.3930, -80.0804 37.3936, -80.0797 37.3942, -80.0790 37.3948, -80.0783 37.3954, -80.0776 37.3960, -80.0769 37.3966, -80.0762 37.3972, -80.0755 37.3978, -80.0748 37.3984, -80.0741 37.3990, -80.0734 37.3996, -80.0727 37.4002, -80.0720 37.4008, -80.0713 37.4014, -80.0706 37.4020, -80.0699 37.4026)';
    // --- Pacific Crest Trail (segment in Yosemite National Park) ---
    const pacificCrestTrail_v1 = 'LINESTRING(-119.3580 37.8752, -119.3573 37.8746, -119.3566 37.8740, -119.3559 37.8734, -119.3552 37.8728, -119.3545 37.8722, -119.3538 37.8716, -119.3531 37.8710, -119.3524 37.8704, -119.3517 37.8698, -119.3510 37.8692, -119.3503 37.8686, -119.3496 37.8680, -119.3489 37.8674, -119.3482 37.8668, -119.3475 37.8662, -119.3468 37.8656, -119.3461 37.8650, -119.3454 37.8644, -119.3447 37.8638, -119.3440 37.8632)';
    const pacificCrestTrail_v2 = 'LINESTRING(-119.3581 37.8751, -119.3574 37.8745, -119.3567 37.8739, -119.3560 37.8733, -119.3553 37.8727, -119.3546 37.8721, -119.3539 37.8715, -119.3532 37.8709, -119.3525 37.8703, -119.3518 37.8697, -119.3511 37.8691, -119.3504 37.8685, -119.3497 37.8679, -119.3490 37.8673, -119.3483 37.8667, -119.3476 37.8661, -119.3469 37.8655, -119.3462 37.8649, -119.3455 37.8643, -119.3448 37.8637, -119.3441 37.8631)';
    // --- Oregon Coast Trail (segment along the Samuel H. Boardman Corridor) ---
    const oregonCoastTrail_v1 = 'LINESTRING(-124.3721 42.1855, -124.3718 42.1849, -124.3715 42.1843, -124.3712 42.1837, -124.3709 42.1831, -124.3706 42.1825, -124.3703 42.1819, -124.3700 42.1813, -124.3697 42.1807, -124.3694 42.1801, -124.3691 42.1795, -124.3688 42.1789, -124.3685 42.1783, -124.3682 42.1777, -124.3679 42.1771, -124.3676 42.1765, -124.3673 42.1759, -124.3670 42.1753, -124.3667 42.1747, -124.3664 42.1741, -124.3661 42.1735)';
    const oregonCoastTrail_v2 = 'LINESTRING(-124.3720 42.1856, -124.3717 42.1850, -124.3714 42.1844, -124.3711 42.1838, -124.3708 42.1832, -124.3705 42.1826, -124.3702 42.1820, -124.3699 42.1814, -124.3696 42.1808, -124.3693 42.1802, -124.3690 42.1796, -124.3687 42.1790, -124.3684 42.1784, -124.3681 42.1778, -124.3678 42.1772, -124.3675 42.1766, -124.3672 42.1760, -124.3669 42.1754, -124.3666 42.1748, -124.3663 42.1742, -124.3660 42.1736)';
    // --- High Sierras ---
    const sierras_v1 = 'LINESTRING(-119.200 37.400, -119.198 37.402, -119.196 37.404, -119.194 37.406, -119.192 37.408, -119.190 37.410, -119.188 37.412, -119.186 37.414, -119.184 37.416, -119.182 37.418, -119.180 37.420, -119.178 37.422, -119.176 37.424, -119.174 37.426, -119.172 37.428, -119.170 37.430, -119.168 37.432, -119.166 37.434, -119.164 37.436, -119.162 37.438)';
    const sierras_v2 = 'LINESTRING(-119.210 37.405, -119.208 37.407, -119.206 37.409, -119.204 37.411, -119.202 37.413, -119.200 37.415, -119.198 37.417, -119.196 37.419, -119.194 37.421, -119.192 37.423, -119.190 37.425, -119.188 37.427, -119.186 37.429, -119.184 37.431, -119.182 37.433, -119.180 37.435, -119.178 37.437, -119.176 37.439, -119.174 37.441, -119.172 37.443)';

  await knex('polylines').insert([
    {
        id: uuidv7(),
        trackId: PCTTrack.id,
        // Use knex.raw to call the PostGIS function ST_GeomFromText.
        // The '?' is a binding that prevents SQL injection.
        // 4326 is the SRID for standard GPS coordinates (WGS 84).
        geom: knex.raw('ST_Force3D(ST_GeomFromText(?, 4326))', [pacificCrestTrail_v1]),
        storage_key: 'http://example.com/pct_v1',
        mime_type: 'gpx'
    },
    {
        id: uuidv7(),
        trackId: PCTTrack.id,
        geom: knex.raw('ST_Force3D(ST_GeomFromText(?, 4326))', [pacificCrestTrail_v2]),
        storage_key: 'http://example.com/pct_v2',
        mime_type: 'gpx'
    },
    {
        id: uuidv7(),
        trackId: OCTTrack.id,
        geom: knex.raw('ST_Force3D(ST_GeomFromText(?, 4326))', [oregonCoastTrail_v1]),
        storage_key: 'http://example.com/oct_v1',
        mime_type: 'gpx'
    },
    {
        id: uuidv7(),
        trackId: OCTTrack.id,
        geom: knex.raw('ST_Force3D(ST_GeomFromText(?, 4326))', [oregonCoastTrail_v2]),
        storage_key: 'http://example.com/oct_v1',
        mime_type: 'gpx'
    },
    {
        id: uuidv7(),
        trackId: ATTrack.id,
        geom: knex.raw('ST_Force3D(ST_GeomFromText(?, 4326))', [appalachianTrail_v1]),
        storage_key: 'http://example.com/at_v1',
        mime_type: 'gpx'
    },
    {
        id: uuidv7(),
        trackId: ATTrack.id,
        geom: knex.raw('ST_Force3D(ST_GeomFromText(?, 4326))', [appalachianTrail_v2]),
        storage_key: 'http://example.com/at_v1',
        mime_type: 'gpx'
    },
    {
        id: uuidv7(),
        trackId: sierrasTrack.id,
        geom: knex.raw('ST_Force3D(ST_GeomFromText(?, 4326))', [sierras_v1]),
        storage_key: 'http://example.com/sierras_v1',
        mime_type: 'gpx'
    },
    {
        id: uuidv7(),
        trackId: sierrasTrack.id,
        geom: knex.raw('ST_Force3D(ST_GeomFromText(?, 4326))', [sierras_v2]),
        storage_key: 'http://example.com/sierras_v2',
        mime_type: 'gpx'
    }
  ]);
};
