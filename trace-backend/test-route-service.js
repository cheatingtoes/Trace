// trace-backend/test-route-service.js
const path = require('path');
const db = require('./config/db');
const { processRouteFile } = require('./services/RouteService');

async function runTest() {
  let tempUserId;
  let tempRouteId;

  try {
    // 1. Create a temporary user
    [tempUserId] = await db('users').insert({ username: 'route-tester', email: 'tester@test.com' }).returning('id');
    console.log(`Created temporary user with ID: ${tempUserId}`);

    // 2. Create a temporary route associated with the user
    [tempRouteId] = await db('routes').insert({ name: 'Test Route', user_id: tempUserId }).returning('id');
    console.log(`Created temporary route with ID: ${tempRouteId}`);

    // 3. Define the path to the sample GPX file
    const gpxFilePath = path.join(__dirname, 'temp_uploads', 'sample.gpx');
    console.log(`Testing with GPX file: ${gpxFilePath}`);

    // 4. Run the service function
    const result = await processRouteFile(gpxFilePath, tempRouteId);
    console.log('--- Test Result ---');
    console.log(JSON.stringify(result, null, 2));

    // 5. Verify polyline was created
    const polyline = await db('polylines').where({ route_id: tempRouteId }).first();
    if (polyline) {
      console.log('✅ Verification successful: Polyline found in database.');
      console.log(polyline);
    } else {
      console.error('❌ Verification failed: Polyline not found in database.');
    }

  } catch (error) {
    console.error('--- Test Failed ---');
    console.error(error);
  } finally {
    // 6. Clean up the temporary data
    if (tempRouteId) {
      // Deleting the route will cascade or should be cleaned up
      await db('polylines').where({ route_id: tempRouteId }).del();
      await db('routes').where({ id: tempRouteId }).del();
      console.log(`\nCleaned up route ID: ${tempRouteId}`);
    }
    if (tempUserId) {
      await db('users').where({ id: tempUserId }).del();
      console.log(`Cleaned up user ID: ${tempUserId}`);
    }
    
    // 7. Close the database connection
    await db.destroy();
    console.log('Database connection closed.');
  }
}

runTest();
