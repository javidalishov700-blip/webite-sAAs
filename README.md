# QR-Universe

A global, multi-tenant SaaS platform for creating interactive, dynamic digital catalogs and menus accessed via QR codes — built for restaurants, retail, electronics stores, and services.

## Run locally

```bash
git checkout cursor/build-qr-universe-saas-8ded
pnpm install
pnpm dev
```

Open [http://localhost:3000/en](http://localhost:3000/en). The app also redirects `/` to your preferred locale (`/en`, `/ru`, `/tr`, `/az`).

### Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next.js 15 dev server on port 3000 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm build` | Production build |

## Demo accounts

Seeded on first run (see `src/lib/data/seed-data.ts`). Password for every account: **`demo1234`**.

| Email | Company |
| --- | --- |
| `demo@bellafoods.com` | Bella Foods (restaurant) |
| `demo@urbansole.com` | Urban Sole (sneaker store) |
| `demo@nexustech.com` | NexusTech (electronics) |

After login you land on `/en/admin`. Sign out from the sidebar user menu. Unauthenticated visits to `/admin` or `/onboarding` redirect to login.

## Public catalogs

No login required. Language switcher on the catalog respects each company’s supported locales.

- [http://localhost:3000/en/c/bella-foods](http://localhost:3000/en/c/bella-foods)
- [http://localhost:3000/en/c/urban-sole](http://localhost:3000/en/c/urban-sole)
- [http://localhost:3000/en/c/nexustech](http://localhost:3000/en/c/nexustech)

### QR scan → catalog → analytics

QR Studio and onboarding encode `/api/qr/{id}/go`. Opening that URL:

1. Records a scan against that specific QR (increments `scans`, appends a `scanEvents` row).
2. Redirects to `/{locale}/c/{slug}?scanned=1&qr={id}`.

Direct catalog visits (no `scanned=1`) are recorded once per browser tab via `POST /api/scans`. Totals show up on the admin Overview chart.

## PWA

The public catalog and marketing site ship as an installable PWA:

- `public/manifest.webmanifest`
- 192 / 512 icons + Apple touch icon
- `appleWebApp` + `themeColor` in the locale layout

Add to Home Screen from a mobile browser; no custom service worker is bundled (avoids stale-cache issues in local/dev).

## Stack

- **Framework:** Next.js 15 (App Router, Server Components, Route Handlers)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, glassmorphism / neon design system
- **Motion/3D:** Motion + React Three Fiber / drei (landing hero only)
- **Data fetching:** TanStack Query + Server Components
- **State:** Zustand (small UI state)
- **Forms/validation:** React Hook Form + Zod
- **i18n:** next-intl — English, Russian, Turkish, Azerbaijani
- **Auth:** Cookie/JWT session (`jose`) + bcrypt
- **Data layer:** Repository pattern + in-memory / `.data/db.json` store (Prisma schema is the future contract — not wired)
- **QR:** qr-code-styling (PNG & SVG export)
- **DnD:** dnd-kit (category reorder)
- **Charts:** Recharts

## Project structure

```
src/
  app/                 # [locale] marketing, auth, admin, public catalog, API
  components/          # UI kit, landing (3D hero), admin, catalog
  lib/                 # data layer, auth, validators, catalog/QR URLs
  hooks/               # React Query hooks
  store/               # Zustand stores
  messages/            # en/ru/tr/az
prisma/
  schema.prisma        # canonical multi-tenant model (not used at runtime)
```

## Data & media

No external database or object storage is required:

- `src/lib/data/*` is a working mock service layer persisted to `.data/db.json`.
- Image uploads are stored as data URLs (`src/lib/media.ts`).
- Do not commit secrets. Copy `.env.example` if you want a local `AUTH_SECRET`; a development fallback is used when it is unset.
