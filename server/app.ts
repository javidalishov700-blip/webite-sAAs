import express, { type Express } from 'express';
import cors from 'cors';
import { PROJECT_STATUSES, type CreateProjectInput, type ProjectStatus } from '../shared/types.js';
import { createDb, type Db } from './db.js';

function isValidStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && (PROJECT_STATUSES as string[]).includes(value);
}

export function createApp(db: Db = createDb()): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/api/stats', (_req, res) => {
    res.json(db.stats());
  });

  app.get('/api/projects', (_req, res) => {
    res.json(db.listProjects());
  });

  app.post('/api/projects', (req, res) => {
    const body = req.body as Partial<CreateProjectInput>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (body.status !== undefined && !isValidStatus(body.status)) {
      return res.status(400).json({ error: `status must be one of ${PROJECT_STATUSES.join(', ')}` });
    }

    const project = db.createProject({
      name,
      description: typeof body.description === 'string' ? body.description.trim() : '',
      status: body.status,
    });
    return res.status(201).json(project);
  });

  app.delete('/api/projects/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'invalid id' });
    }
    const deleted = db.deleteProject(id);
    if (!deleted) {
      return res.status(404).json({ error: 'project not found' });
    }
    return res.status(204).send();
  });

  return app;
}
