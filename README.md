# QR-Universe

Interactive QR catalogs for restaurants, retail, electronics and services.

## Local

```bash
git checkout cursor/build-qr-universe-saas-8ded
pnpm install
pnpm dev
```

http://localhost:3000/en

Live sample catalog (no login): http://localhost:3000/en/c/live-demo

Create a real workspace: http://localhost:3000/en/signup

## Production env (you fill these)

Copy `.env.example` → `.env` on the server.

| Variable | What to put |
| --- | --- |
| `AUTH_SECRET` | Long random string (`openssl rand -base64 48`) |
| `NEXT_PUBLIC_SITE_URL` | Public URL, e.g. `https://your-domain.com` |
| `DATABASE_URL` | Neon Postgres connection string (see below) |
| `NEXT_PUBLIC_CONTACT_PHONE` | Default already `+905413230002` |

Contact on the site is **+90 541 323 00 02** (call + WhatsApp).

## Database & media

The app uses **Neon Postgres** (`DATABASE_URL`) and **Neon Object Storage** (S3-compatible `AWS_*` vars). Copy `.env.example` → `.env`, then:

```bash
pnpm install
pnpm db:push
pnpm seed
pnpm dev
```

Uploads go to the `qr-universe` bucket and are served at `/api/media/...`.

## What was removed / how catalogs work

- Demo **logins** are gone. Nobody signs in as bellafoods/urbansole.
- New signups start with **zero categories** — owners type their own names.
- A public **Live Kitchen** catalog exists only so “Live demo” on the homepage works (`/c/live-demo`). It has no password.

## Checks

`pnpm lint` · `pnpm typecheck` · `pnpm build`
