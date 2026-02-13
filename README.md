# FeastQR: Open Source SaaS Online Menu System 🌐

## cPanel-ready deployment

This fork is adapted to run on **cPanel Node.js Application** hosting.

### What changed
- Added a single startup file: `app.js`.
- Production startup now uses `node app.js`.
- Build now runs `prisma generate && next build`.
- Added cPanel deployment playbook with troubleshooting.

👉 Full guide: [`docs/CPANEL_DEPLOY.md`](docs/CPANEL_DEPLOY.md)

## Quick start (local)

```bash
npm install
cp .env.example .env
npm run build
PORT=3000 npm run start
```

## Stack
- Next.js 14 (App Router)
- tRPC route handlers
- Supabase (auth/storage)
- Prisma + Postgres
- Tailwind + shadcn/ui
