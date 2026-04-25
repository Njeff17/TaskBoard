const request = require('supertest');

process.env.NODE_ENV = 'test';

const app = require('../app');
const { sequelize, User, Project, Task } = require('../src/models');

// ── Helpers ───────────────────────────────────────────────────────────────────

const registerAndLogin = async (email = 'user@example.com') => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'User', email, password: 'secret123' });
  return res.body.token;
};

const createProject = async (token, name = 'Test Project') => {
  const res = await request(app)
    .post('/api/v1/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name });
  return res.body.project;
};

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await Task.destroy({ where: {}, truncate: true, cascade: true });
  await Project.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

// ── Create task ───────────────────────────────────────────────────────────────

describe('POST /api/v1/projects/:projectId/tasks', () => {
  it('creates a task inside a project', async () => {
    const token = await registerAndLogin();
    const project = await createProject(token);

    const res = await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write tests', status: 'TODO' });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe('Write tests');
    expect(res.body.task.status).toBe('TODO');
    expect(Number(res.body.task.projectId)).toBe(project.id);
  });

  it('returns 400 for an invalid status value', async () => {
    const token = await registerAndLogin();
    const project = await createProject(token);

    const res = await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bad task', status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is missing', async () => {
    const token = await registerAndLogin();
    const project = await createProject(token);

    const res = await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No title given' });

    expect(res.status).toBe(400);
  });

  it("returns 404 when creating a task in another user's project", async () => {
    const tokenA = await registerAndLogin('alice@example.com');
    const tokenB = await registerAndLogin('bob@example.com');
    const project = await createProject(tokenA);

    const res = await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Sneaky task' });

    expect(res.status).toBe(404);
  });
});

// ── List tasks ────────────────────────────────────────────────────────────────

describe('GET /api/v1/projects/:projectId/tasks', () => {
  it('lists all tasks in a project', async () => {
    const token = await registerAndLogin();
    const project = await createProject(token);

    await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task A', status: 'TODO' });
    await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task B', status: 'DONE' });

    const res = await request(app)
      .get(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
  });

  it('filters tasks by status', async () => {
    const token = await registerAndLogin();
    const project = await createProject(token);

    await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To Do Task', status: 'TODO' });
    await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Done Task', status: 'DONE' });

    const res = await request(app)
      .get(`/api/v1/projects/${project.id}/tasks?status=TODO`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].status).toBe('TODO');
  });
});

// ── Update task ───────────────────────────────────────────────────────────────

describe('PATCH /api/v1/projects/:projectId/tasks/:taskId', () => {
  it('updates task status to IN_PROGRESS', async () => {
    const token = await registerAndLogin();
    const project = await createProject(token);
    const createRes = await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Task', status: 'TODO' });

    const taskId = createRes.body.task.id;
    const res = await request(app)
      .patch(`/api/v1/projects/${project.id}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('IN_PROGRESS');
  });
});

// ── Delete task & cascade ─────────────────────────────────────────────────────

describe('Cascade delete — deleting a project removes its tasks', () => {
  it('removes all tasks when the project is deleted', async () => {
    const token = await registerAndLogin();
    const project = await createProject(token);

    await request(app)
      .post(`/api/v1/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task to be deleted', status: 'TODO' });

    // Delete the project
    await request(app)
      .delete(`/api/v1/projects/${project.id}`)
      .set('Authorization', `Bearer ${token}`);

    // Tasks should be gone
    const remaining = await Task.findAll({ where: { projectId: project.id } });
    expect(remaining).toHaveLength(0);
  });
});
