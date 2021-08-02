import supertest from 'supertest';
import slugify from 'slugify';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import app from '../../server';
import hooks from '../setup_hooks';
import Department from '../../models/Department';
import User from '../../models/User';

dotenv.config();

const request = supertest(app);
const databaseName = 'auth-login';

const fakeBanner = {
  publicId: 'fake_id',
  url: 'http://fakedomain.fakeimage.png',
};

const adminUser = {
  username: 'Admin user',
  password: 'mysuperduperpassword',
  email: 'admin@admin',
  emailVerified: true,
  authProvider: 'local',
  role: 'Admin',
};

const createAdminUser = async () => {
  await new User(adminUser).save();

  const secret = process.env.JWT_SECRET || 'some_secret_word';
  const token = jwt.sign(
    {
      username: adminUser.username,
      createdAt: new Date(),
      email: adminUser.email,
    },
    secret,
    {
      expiresIn: '2h',
    }
  );

  return cookie.serialize(
    'token',
    JSON.stringify({ token, provider: 'local' }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 3600
      path: '/',
    }
  );
};

jest.setTimeout(10000);

describe('departement entity end points', () => {
  hooks.setupDB(databaseName);
  const departments = [
    {
      slug: slugify('Food and Fitness'),
      name: 'Food and Fitness',
      banners: [fakeBanner, fakeBanner, fakeBanner, fakeBanner],
      description:
        'random long description : Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam explicabo error officia harum a, in accusantium corrupti nemo maxime optio magni veritatis iure reprehenderit illo obcaecati eius dolorum, quis consequatur eligendi, reiciendis ipsam rerum veniam distinctio. Debitis veritatis natus animi. Dolore hic odit ad repellat nesciunt esse, quo fuga corrupti?',
    },
    {
      name: 'Man Clothe',
      slug: slugify('Man Clothe'),
      banners: [fakeBanner, fakeBanner, fakeBanner, fakeBanner],
      description:
        'random long description : Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam explicabo error officia harum a, in accusantium corrupti nemo maxime optio magni veritatis iure reprehenderit illo obcaecati eius dolorum, quis consequatur eligendi, reiciendis ipsam rerum veniam distinctio. Debitis veritatis natus animi. Dolore hic odit ad repellat nesciunt esse, quo fuga corrupti?',
    },
  ];

  const newDepartment = {
    name: 'Woman Clothe',
    slug: slugify('Woman Clothe'),
    banners: [fakeBanner, fakeBanner, fakeBanner, fakeBanner],
    description:
      'random long description : Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam explicabo error officia harum a, in accusantium corrupti nemo maxime optio magni veritatis iure reprehenderit illo obcaecati eius dolorum, quis consequatur eligendi, reiciendis ipsam rerum veniam distinctio. Debitis veritatis natus animi. Dolore hic odit ad repellat nesciunt esse, quo fuga corrupti?',
  };

  beforeEach(async () => {
    await Department.insertMany(departments);
  });

  // clear user collection after each test complete
  afterEach(async () => {
    await Department.deleteMany({});
    await User.deleteMany({});
  });

  it(' /departments/list : list all the current departments', async () => {
    const response = await request
      .get('/api/departments/list')
      .expect('Content-Type', /json/);
    expect(response.status).toBe(200);

    expect(response.body).toHaveLength(departments.length);
    const departmentNames: string[] = response.body.map(
      (element: any) => element.name
    );
    expect(departmentNames).toContain(departments[0].name);
    expect(departmentNames).toContain(departments[1].name);

    // check that each department has an slug
    const departmentSlugs: string[] = response.body.map(
      (element: any) => element.slug
    );

    expect(departmentSlugs).toContain(slugify(departments[0].name));
    expect(departmentSlugs).toContain(slugify(departments[1].name));
  });

  it('/departments/fetchOne : fetch and return the desire department', async () => {
    const desired = departments[0];
    const response = await request
      .get(`/api/departments/list/${slugify(desired.name)}`)
      .expect('Content-Type', /json/);
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();

    const { name, slug, banners, description } = response.body;

    expect(name).toBe(desired.name);
    expect(slug).toBe(slugify(desired.name));
    expect(description).toBe(desired.description);

    const bannerUrls: string[] = banners.map((element: any) => element.url);
    expect(bannerUrls).toContain(fakeBanner.url);
  });

  it('/departments/create : create a new department if input data is valid', async () => {
    const adminCookie = await createAdminUser();

    const response = await request
      .post('/api/departments/create')
      .set('Cookie', adminCookie)
      .send(newDepartment)
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);

    // check that the department is returned
    expect(response.body.name).toBe(newDepartment.name);
    expect(response.body.slug).toBe(newDepartment.slug);
    expect(response.body.banners[0].url).toBe(newDepartment.banners[0].url);
    expect(response.body.description).toBe(newDepartment.description);

    // check that the department was saved
    const saved = await Department.findOne({ name: newDepartment.name }).lean();
    expect(saved).toBeTruthy();
    expect(saved?.slug).toBe(slugify(newDepartment.name));
  });

  it('/departments/create : if input data is invalid return an error response and not create a new department', async () => {
    const adminCookie = await createAdminUser();

    const response = await request
      .post('/api/departments/create')
      .set('Cookie', adminCookie)
      .send({
        name: '2',
        banners: newDepartment.banners.pop(),
        description: 'too short description',
      })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Bad input data');
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);

    // check that the department is not created
    const saved = await Department.findOne({ name: '2' }).lean();
    expect(saved).toBeNull();
  });

  it('/departments/update/:slug : update an existing department if data is valid', async () => {
    const adminCookie = await createAdminUser();
    const currentDep = departments[0];
    const newName = 'Random Name';

    const response = await request
      .patch(`/api/departments/update/${currentDep.slug}`)
      .set('Cookie', adminCookie)
      .send({ ...currentDep, name: newName })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    expect(response.body.message).toBeTruthy();

    // check that the department change is  saved;
    const updated = await Department.findOne({ name: newName }).lean();
    expect(updated).toBeTruthy();
    expect(updated?.name).toBe(newName);
    expect(updated?.slug).toBe(slugify(newName));
  });

  it('/departments/update/:slug : if no exist department with the given slug return an error response', async () => {
    const adminCookie = await createAdminUser();
    const currentDep = departments[0];
    const newName = 'Random Name';

    const response = await request
      .patch(`/api/departments/update/no_exist_slug`)
      .set('Cookie', adminCookie)
      .send({ ...currentDep, name: newName })
      .expect('Content-Type', /json/);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      'No department was found with this slug'
    );
  });

  // it('/departments/delete/:slug : remove an existing department with the given slug', async () => {
  //   const adminCookie = await createAdminUser();
  //   const desired = departments[0];

  //   const response = await request
  //     .delete(`/api/departments/delete/${desired.slug}`)
  //     .set('Cookie', adminCookie)
  //     .expect('Content-Type', /json/);

  //   expect(response.status).toBe(200);
  //   expect(response.body.message).toBe('department removed correctly');
  // });

  // it('/departments/delete/:slug :  if no exist department with the given slug return an error response', async () => {
  //   const adminCookie = await createAdminUser();

  //   const response = await request
  //     .delete(`/api/departments/delete/no_exist_slug`)
  //     .set('Cookie', adminCookie)
  //     .expect('Content-Type', /json/);

  //   expect(response.status).toBe(404);
  //   expect(response.body.message).toBe(
  //     'No department was found with this slug'
  //   );
  // });
});
