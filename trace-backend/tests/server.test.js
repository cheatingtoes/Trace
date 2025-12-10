const request = require('supertest');
const { app, server } = require('../server');

describe('GET /', () => {
  it('should respond with "Trace API is running."', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Trace API is running.');
  });
});

afterAll(done => {
  server.close(done);
});