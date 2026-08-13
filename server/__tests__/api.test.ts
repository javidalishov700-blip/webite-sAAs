import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../app.js';
import { createDb, type Db } from '../db.js';

describe('projects API', () => {
  let app: Express;
  let db: Db;

  beforeAll(() => {
    db = createDb(':memory:');
    app = createApp(db);
  });

  afterAll(() => {
    db.close();
  });

  it('reports health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('starts with no projects', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Launch newsletter', description: 'Weekly digest', status: 'active' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Launch newsletter',
      description: 'Weekly digest',
      status: 'active',
    });
    expect(res.body.id).toBeGreaterThan(0);
  });

  it('rejects a project without a name', async () => {
    const res = await request(app).post('/api/projects').send({ description: 'no name' });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid status', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'x', status: 'nope' });
    expect(res.status).toBe(400);
  });

  it('aggregates stats', async () => {
    await request(app).post('/api/projects').send({ name: 'Paused thing', status: 'paused' });
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
    expect(res.body.active).toBeGreaterThanOrEqual(1);
    expect(res.body.paused).toBeGreaterThanOrEqual(1);
  });

  it('deletes a project', async () => {
    const created = await request(app).post('/api/projects').send({ name: 'To delete' });
    const id = created.body.id as number;
    const del = await request(app).delete(`/api/projects/${id}`);
    expect(del.status).toBe(204);
    const missing = await request(app).delete(`/api/projects/${id}`);
    expect(missing.status).toBe(404);
  });
});
