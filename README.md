# FeastQR: Open Source SaaS Online Menu System 🌐

This fork is adapted to run on **cPanel Node.js Application** hosting with a required startup file (`app.js`).

## Quick audit of this codebase (for deployment decisions)

- **Framework**: Next.js 14 + App Router (`src/app`).
- **Server features in use**: route handlers (`src/app/api/*`), middleware (`src/middleware.ts`), dynamic/authenticated pages.
- **Data/Auth**: Supabase + Prisma.
- **Conclusion**: full static export is only a fallback; the primary deployment target is Node runtime (`node app.js`).

## Required project layout at runtime

Your deployment folder must contain these entries at its root:

- `package.json`
- `app.js`
- `next.config.mjs`
- `src/`
- `public/`
- `prisma/`

## Local quick start

```bash
npm install
cp .env.example .env
npm run build
PORT=3000 npm run start
```

## cPanel deployment (step-by-step)

Use the full runbook here:

👉 [`docs/CPANEL_DEPLOY.md`](docs/CPANEL_DEPLOY.md)

This includes:
- Node version guidance
- exact cPanel setup values
- upload strategy (including ZIP extraction pitfalls)
- env variable mapping
- startup/restart instructions
- Prisma compatibility notes
- troubleshooting (including `ENOENT package.json`)
