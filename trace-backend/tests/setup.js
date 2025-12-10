// This file is run by Jest before starting the test suites.

// We are mocking the entire 'knex' library.
jest.mock('knex', () => {
  // The mock needs to return a function, because the real knex is initialized like:
  // const db = knex(dbConfig);
  const knexMock = () => {
    // This is the fake 'db' object that will be returned.
    // It needs to have all the methods that your application uses during startup.
    return {
      // The db.raw('SELECT 1').then(...).catch(...) chain in db.js needs to work.
      // We make raw() return `this` so we can chain `then()` and `catch()` off it.
      raw: jest.fn().mockReturnThis(),
      // We make then() and catch() do nothing but return `this` as well.
      then: jest.fn().mockReturnThis(),
      catch: jest.fn().mockReturnThis(),
      // If your app uses other knex methods on startup, you'd add them here.
    };
  };
  return knexMock;
});
