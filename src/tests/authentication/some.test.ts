import supertest from 'supertest';
import app from '../../server';
import hooks from '../setup_hooks';

const request = supertest(app);
const databaseName = 'basic-test';

describe('some random test to begin', () => {
  hooks.setupDB(databaseName);

  it('Testing to see if Jest works', async () => {
    // Sends GET Request to /test endpoint
    const response = await request.get('/test').expect('Content-Type', /json/);
    expect(response.status).toBe(404);
    expect(response.body).toBeTruthy();
  });
});
