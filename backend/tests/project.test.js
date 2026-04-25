const request = require('supertest');

process.env.NODE_ENV = 'test';

const app = require('../app');
const { sequelize, User, Project } = require('../src/models');

// ── Helpers ───────────────────────────────────────────────────────────────────

const registerAndLogin = async (email = 'user@example.com', name = 'User') => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ name, email, password: 'secret123' });
  return res.body.token;
};

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await Project.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

// ── Create project ────────────────────────────────────────────────────────────

describe('POST /api/v1/projects', () => {
  it('creates a project for an authenticated user', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My First Project', description: 'A test project' });

    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe('My First Project');
    expect(res.body.project).toHaveProperty('id');
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .send({ name: 'Hacker Project' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No name provided' });

    expect(res.status).toBe(400);
  });
});

// ── List projects ─────────────────────────────────────────────────────────────

describe('GET /api/v1/projects', () => {
  it('returns only the projects owned by the requesting user', async () => {
    const tokenA = await registerAndLogin('alice@example.com', 'Alice');
    const tokenB = await registerAndLogin('bob@example.com', 'Bob');

    // Alice creates 2 projects, Bob creates 1
    await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: "Alice's Project 1" });
    await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: "Alice's Project 2" });
    await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: "Bob's Project" });

    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.projects).toHaveLength(2);
    res.body.projects.forEach((p) => expect(p.name).toContain("Alice's"));
  });
});

// ── Update project ────────────────────────────────────────────────────────────

describe('PATCH /api/v1/projects/:id', () => {
  it('renames a project', async () => {
    const token = await registerAndLogin();
    const create = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Old Name' });

    const { id } = create.body.project;
    const res = await request(app)
      .patch(`/api/v1/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe('New Name');
  });

  it("returns 404 when trying to update another user's project", async () => {
    const tokenA = await registerAndLogin('alice@example.com', 'Alice');
    const tokenB = await registerAndLogin('bob@example.com', 'Bob');

    const create = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: "Alice's Secret Project" });

    const { id } = create.body.project;
    const res = await request(app)
      .patch(`/api/v1/projects/${id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Stolen Name' });

    expect(res.status).toBe(404);
  });
});

// ── Delete project ────────────────────────────────────────────────────────────

describe('DELETE /api/v1/projects/:id', () => {
  it('deletes a project successfully', async () => {
    const token = await registerAndLogin();
    const create = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Doomed Project' });

    const { id } = create.body.project;
    const del = await request(app)
      .delete(`/api/v1/projects/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(200);

    const get = await request(app)
      .get(`/api/v1/projects/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(404);
  });
});
