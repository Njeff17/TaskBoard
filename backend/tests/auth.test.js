const request = require('supertest');

// Load env before app so JWT_SECRET is set
process.env.NODE_ENV = 'test';

const app = require('../app');
const { sequelize, User } = require('../src/models');

// Setup / Teardown

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

// Register

describe('POST /api/v1/auth/register', () => {
  const validPayload = { name: 'Alice', email: 'alice@example.com', password: 'secret123' };

  it('registers a new user and returns a JWT token', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ name: 'Alice', email: 'alice@example.com' });
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 409 when email is already registered', async () => {
    await request(app).post('/api/v1/auth/register').send(validPayload);
    const res = await request(app).post('/api/v1/auth/register').send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bob', email: 'not-an-email', password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('password');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'bob@example.com', password: 'secret123' });

    expect(res.status).toBe(400);
  });
});

// Login

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
  });

  it('logs in with correct credentials and returns a JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@example.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('alice@example.com');
  });

  it('returns 401 for a wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 for a non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(res.status).toBe(401);
  });
});

// Profile

describe('GET /api/v1/auth/profile', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
    token = res.body.token;
  });

  it('returns the authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('alice@example.com');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/auth/profile');
    expect(res.status).toBe(401);
  });
});
