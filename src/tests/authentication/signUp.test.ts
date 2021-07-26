import supertest from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../server';
import hooks from '../setup_hooks';
import User from '../../models/User';

const request = supertest(app);
const databaseName = 'auth-registration';

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

describe('user registration end point', () => {
  hooks.setupDB(databaseName);

  // clear user collection after each test complete
  afterEach(async () => {
    await User.deleteMany({});
  });

  it("if user send valid data, a new user is created and it's password is hasehd before stored", async () => {
    const response = await request
      .post('/api/auth/sign-up')
      .send(user)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    expect(response.body.message).toBeTruthy();

    const newUser = await User.findOne({ email: user.email }).lean();
    expect(newUser).toBeTruthy();
    expect(newUser?.username).toEqual(user.username);
    const comparison = await bcrypt.compare(user.password, newUser!.password!);
    expect(comparison).toBe(true);
  });

  it('if user send invalid data, an error response is send with data and no user is created', async () => {
    const response = await request
      .post('/api/auth/sign-up')
      .send(badUser)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Bad input data');
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    const newUser = await User.findOne({ email: badUser.email }).lean();
    expect(newUser).toBeNull();
  });

  it('if user send an email already in use, an error response is send and no user is created', async () => {
    await new User({ ...user, authProvider: 'local' }).save();
    const response = await request
      .post('/api/auth/sign-up')
      .send(user)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Adress already taken');

    const newUser = await User.findOne({ email: badUser.email }).lean();
    expect(newUser).toBeNull();
  });
});
