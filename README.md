# webite-sAAs

A self-contained, full-stack **SaaS starter** you can run in one command — no external
services or secrets required.

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Express + TypeScript REST API
- **Storage:** SQLite (via `better-sqlite3`), persisted to `data/app.sqlite`

It ships with a working **projects dashboard**: create, list, and delete projects, with live
stat cards — a realistic end-to-end slice (UI → API → database → UI).

## Quick start

```bash
npm ci        # install dependencies
npm run dev   # start web (http://localhost:5173) + api (http://localhost:3001)
```

The Vite dev server proxies `/api/*` to the Express backend, so the whole app runs behind a
single origin at http://localhost:5173.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the web and API dev servers together (hot reload). |
| `npm run build` | Type-check and build the production web bundle to `dist/`. |
| `npm start` | Run the API server in production mode. |
| `npm run typecheck` | Type-check the web and server projects. |
| `npm run lint` | Lint with ESLint. |
| `npm test` | Run the API test suite (Vitest + Supertest). |

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness probe. |
| `GET` | `/api/projects` | List projects (newest first). |
| `POST` | `/api/projects` | Create a project (`name` required). |
| `DELETE` | `/api/projects/:id` | Delete a project. |
| `GET` | `/api/stats` | Aggregate counts by status. |

## Project layout

```
server/          Express API (app.ts, db.ts, index.ts) + tests
src/             React frontend (App.tsx, api.ts, components)
shared/          Types shared between client and server
.cursor/         Cloud Agent environment configuration
```

## Cloud Agent environment

`.cursor/environment.json` installs dependencies with `npm ci` and launches the `dev` terminal
(`npm run dev`), exposing ports `5173` (web) and `3001` (api).
