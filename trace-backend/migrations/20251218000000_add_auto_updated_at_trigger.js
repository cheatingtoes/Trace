
const ON_UPDATE_TIMESTAMP_FUNCTION = `
  CREATE OR REPLACE FUNCTION on_update_timestamp()
  RETURNS trigger AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
$$ language 'plpgsql';
`;

const DROP_ON_UPDATE_TIMESTAMP_FUNCTION = `DROP FUNCTION on_update_timestamp`;

const tables = [
  'users',
  'activities',
  'tracks',
  'polylines',
  'moments',
];

exports.up = async knex => {
  await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
  for (const table of tables) {
    await knex.raw(`
      CREATE TRIGGER ${table}_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      EXECUTE PROCEDURE on_update_timestamp();
    `);
  }
};

exports.down = async knex => {
  for (const table of tables) {
    await knex.raw(`DROP TRIGGER ${table}_updated_at ON ${table}`);
  }
  await knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
};
