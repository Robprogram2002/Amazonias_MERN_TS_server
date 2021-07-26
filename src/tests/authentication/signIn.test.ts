import supertest from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../server';
import hooks from '../setup_hooks';
import User from '../../models/User';

const request = supertest(app);
const databaseName = 'auth-login';

const user = {
  username: 'Alberto Rios',
  password: 'mysuperduperpassword',
  email: 'alberto@rios.com',
};

const badUser = {
  username: 'Alberto Rios',
  email: 'novalidemail',
  password: '123',
};

const notVerifiedEmail = 'alberto.second@rios.com';

describe('user log in end point', () => {
  hooks.setupDB(databaseName);

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    await new User({
      ...user,
      password: hashedPassword,
      authProvider: 'local',
      emailVerified: true,
    }).save();

    await new User({
      ...user,
      password: hashedPassword,
      email: notVerifiedEmail,
      authProvider: 'local',
      emailVerified: false,
    }).save();
  });

  // clear user collection after each test complete
  afterEach(async () => {
    await User.deleteMany({});
  });

  it('if user send valid data and user is register, user data and cookie is send', async () => {
    const response = await request
      .post('/api/auth/local-signin')
      .send(user)
      .expect('Content-Type', /json/);
    expect(response.status).toBe(200);

    const loginUser = await User.findOne({ email: user.email }).lean();
    const userRes = response.body.user;
    expect(userRes.username).toEqual(loginUser?.username);
    expect(userRes.email).toEqual(loginUser?.email);
    expect(userRes.photoUrl).toEqual(loginUser?.photoUrl);

    expect(response.headers['set-cookie']).toBeTruthy();
  });

  it('if user send invalid data, an error response is send with data and cookie is not set', async () => {
    const response = await request
      .post('/api/auth/local-signin')
      .send(badUser)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Bad input data');
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.headers['set-cookie']).not.toBeTruthy();
  });

  it('if user is not register, an error response is send with data and cookie is not set', async () => {
    const response = await request
      .post('/api/auth/local-signin')
      .send({ ...user, email: 'email@random.com' })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('No user found with these credentials');
    expect(response.headers['set-cookie']).not.toBeTruthy();
  });

  it('if email is not verified, an error response is send with data and cookie is not set', async () => {
    const response = await request
      .post('/api/auth/local-signin')
      .send({ ...user, email: notVerifiedEmail })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'This email address has not been verified'
    );
    expect(response.headers['set-cookie']).not.toBeTruthy();
  });

  it('if password does not macth, an error response is send with data and cookie is not set', async () => {
    const response = await request
      .post('/api/auth/local-signin')
      .send({ ...user, password: 'nomatchpassword' })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid password');
    expect(response.headers['set-cookie']).not.toBeTruthy();
  });
});
