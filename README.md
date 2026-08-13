# QR-Universe

A global, multi-tenant SaaS platform for creating interactive, dynamic digital catalogs and menus accessed via QR codes — built for restaurants, retail, electronics stores, and services.

## Stack

- **Framework:** Next.js 15 (App Router, Server Components, Server Actions, Route Handlers)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first theme), custom glassmorphism/glow design system
- **Motion/3D:** Motion (Framer Motion successor) + React Three Fiber / drei for the WebGL hero
- **Data fetching:** TanStack Query (client) + Server Components (server)
- **State:** Zustand (small client UI state), React Query cache (server state)
- **Forms/validation:** React Hook Form + Zod
- **i18n:** next-intl — English, Russian, Turkish, Azerbaijani
- **Auth:** Custom cookie/JWT session (jose) + bcrypt password hashing
- **Data layer:** Repository pattern backed by an in-memory + on-disk JSON store that mirrors the `prisma/schema.prisma` data model 1:1, so it can be swapped for a real Postgres database via Prisma without touching call sites
- **QR generation:** qr-code-styling (dots/colors/logo, PNG & SVG export)
- **DnD:** dnd-kit (category reordering)
- **Charts:** Recharts

## Getting started

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000) and redirects to your preferred locale (`/en`, `/ru`, `/tr`, `/az`).

### Demo accounts

Seeded on first run (see `src/lib/data/seed-data.ts`):

| Email | Password | Company |
| --- | --- | --- |
| `demo@bellafoods.com` | `demo1234` | Bella Foods (restaurant) |
| `demo@urbansole.com` | `demo1234` | Urban Sole (sneaker store) |
| `demo@nexustech.com` | `demo1234` | NexusTech (electronics) |

Public catalogs (no login required):

- `/en/c/bella-foods`
- `/en/c/urban-sole`
- `/en/c/nexustech`

## Project structure

```
src/
  app/                 # Next.js routes ([locale] marketing, auth, admin, public catalog, API routes)
  components/          # UI kit, landing, admin, catalog components
  lib/                 # data layer, auth, i18n helpers, utils, validators
  hooks/               # React Query hooks
  store/               # Zustand stores
  messages/            # en/ru/tr/az translation catalogs
prisma/
  schema.prisma        # canonical multi-tenant data model definition
```

## Notes on the data & media layer

No external database or object storage is provisioned in this environment. Rather than leaving the app non-functional, the backend is implemented as a fully working, well-abstracted **mock service layer**:

- `prisma/schema.prisma` documents the production data model (Postgres-ready, multi-tenant, with row-level isolation by `companyId`).
- `src/lib/data/*` implements the same models with an in-memory store, persisted to `.data/db.json` between requests/dev-server restarts, exposed through repository functions (`getCompanyBySlug`, `createItem`, `reorderCategories`, …). Swapping this for real Prisma calls later only requires changing the repository implementations — every consumer already talks to the repository interface.
- Image "uploads" are handled by a mock media service (`src/lib/media.ts`) that accepts a file, stores it as a data URL, and returns a stable URL — trivially swappable for S3/Cloudinary/Vercel Blob later.
