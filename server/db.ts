import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import type { CreateProjectInput, Project, Stats } from '../shared/types.js';

// Using an on-disk SQLite database by default so records survive restarts.
// Tests pass ':memory:' for an isolated, ephemeral database.
const DEFAULT_DB_PATH = resolve(process.cwd(), 'data', 'app.sqlite');

export function createDb(dbPath: string = process.env.DATABASE_PATH ?? DEFAULT_DB_PATH) {
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return {
    listProjects(): Project[] {
      const rows = db
        .prepare('SELECT id, name, description, status, created_at as createdAt FROM projects ORDER BY id DESC')
        .all();
      return rows as Project[];
    },

    createProject(input: CreateProjectInput): Project {
      const info = db
        .prepare('INSERT INTO projects (name, description, status) VALUES (?, ?, ?)')
        .run(input.name, input.description ?? '', input.status ?? 'active');
      return db
        .prepare('SELECT id, name, description, status, created_at as createdAt FROM projects WHERE id = ?')
        .get(info.lastInsertRowid) as Project;
    },

    deleteProject(id: number): boolean {
      const info = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
      return info.changes > 0;
    },

    stats(): Stats {
      const total = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number }).c;
      const byStatus = db
        .prepare('SELECT status, COUNT(*) as c FROM projects GROUP BY status')
        .all() as { status: string; c: number }[];
      const counts = Object.fromEntries(byStatus.map((r) => [r.status, r.c]));
      return {
        total,
        active: counts.active ?? 0,
        paused: counts.paused ?? 0,
        archived: counts.archived ?? 0,
      };
    },

    close() {
      db.close();
    },
  };
}

export type Db = ReturnType<typeof createDb>;
