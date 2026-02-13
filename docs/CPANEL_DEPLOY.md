# FeastQR Deployment Guide for cPanel (Node.js Application)

This repository is now structured to run on cPanel using a **single startup file** (`app.js`) and standard npm scripts.

## 1) Technical audit (before migration)

### Stack identified in this repository
- **Framework**: Next.js 14 (App Router, `src/app`) with route handlers (`src/app/api/*`).
- **Backend integration**: tRPC route handler (`src/app/api/trpc/[trpc]/route.ts`) plus Supabase server calls.
- **Database**: Prisma client for Postgres/Supabase (`prisma/schema.prisma`, `src/server/db.ts`).
- **Auth/storage**: Supabase (`src/server/supabase/*`).
- **Middleware**: Next middleware for i18n cookie flow (`src/middleware.ts`).

### cPanel blockers found
1. cPanel expects a **single startup file**; `next start` alone is not always enough in shared hosting workflows.
2. Shared environments require port from `process.env.PORT` (hardcoded ports break startup).
3. Prisma client generation must happen in the host environment to avoid binary mismatch.
4. Existing docs were Vercel-oriented and lacked cPanel-specific build/start/restart steps.

### Strategies considered
- **Strategy 1 (chosen)**: Keep Next.js monolith and add a custom Node startup (`app.js`) that programmatically boots Next and listens on `process.env.PORT`.
  - Pros: minimal code rewrite, preserves SSR/API routes/tRPC/auth flow.
  - Cons: still depends on Node runtime and successful Prisma generation on host.
- **Strategy 2**: split frontend and backend (static frontend + Express API + Supabase).
  - Pros: easier static hosting for frontend.
  - Cons: major refactor risk, more moving parts, larger regression surface.

## 2) cPanel-ready structure

Key runtime files:
- `app.js` → startup file used by cPanel.
- `package.json` scripts:
  - `npm run build` → `prisma generate && next build`
  - `npm run start` → `node app.js`

## 3) Prerequisites in cPanel

1. Open **Setup Node.js App** in cPanel.
2. Choose **Node.js 18 or 20** (recommended: 20 LTS if available).
3. Set:
   - **Application root**: folder where this repo is uploaded (example: `/home/<cpanel_user>/feastqr`)
   - **Application URL**: your mapped domain/subdomain
   - **Application startup file**: `app.js`

## 4) Upload files

Upload the repository contents to the Application root, including:
- `app.js`
- `package.json`
- `next.config.mjs`
- `src/`, `public/`, `prisma/`
- lockfile (`pnpm-lock.yaml` is optional if you use npm in cPanel)

Do **not** upload secrets in `.env`.

## 5) Install and build in cPanel

Run from cPanel terminal (inside Application root):

```bash
npm install
npm run build
```

Then click **Restart** in cPanel Node.js App UI, or run:

```bash
npm run start
```

> In cPanel UI, process management is usually done with the Restart button after install/build.

## 6) Environment variables (required)

Set these in cPanel **Application Environment Variables**:

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (server only)
- `DATABASE_URL`
- `DIRECT_URL`
- `LEMON_SQUEEZY_API_KEY`
- `LEMONS_SQUEEZY_SIGNATURE_SECRET`
- `LEMON_SQUEEZY_STORE_ID`
- `LEMON_SQUEEZY_SUBSCRIPTION_VARIANT_ID`
- (optional) `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_URL`

> `PORT` is typically injected by cPanel/Passenger automatically. Do not hardcode it.

## 7) Prisma/database notes

- `npm run build` includes `prisma generate` to produce a host-compatible Prisma client.
- For schema migrations in production, run controlled commands manually (for example `npx prisma migrate deploy`) only if your workflow needs it.
- Prefer running build directly on cPanel host to avoid Prisma engine mismatch.

## 8) Startup and logs

- Startup file: `app.js`
- Start command: handled by cPanel app runner (or `npm run start` manually)
- Check logs in:
  - cPanel Node.js application logs
  - `stderr`/`stdout` log entries visible in the app panel/terminal

The server logs a clear line at boot:
`[FeastQR] Server started on http://<host>:<port> (NODE_ENV=<env>)`

## 9) Troubleshooting

### "Not Found" on root URL
- Verify **Application URL** and **Application root** in cPanel match your upload location.
- Restart the Node.js app after changes.

### Port binding errors
- Ensure app uses `process.env.PORT` (already handled in `app.js`).
- Remove any custom hardcoded port from startup scripts.

### Build failures with Prisma
- Run `npm install` before `npm run build`.
- Ensure `DATABASE_URL` and `DIRECT_URL` are set and valid.
- Rebuild on the same host where the app runs.

### Static assets or `_next` assets missing
- Confirm build completed successfully (`next build` output without errors).
- Restart app to load fresh build.

### Route/API failures
- Confirm environment variables are present in cPanel app config.
- Verify webhook secrets (LemonSqueezy) are correct.

### Stale behavior after deploy
- Restart Node.js app from cPanel.
- Clear CDN/proxy cache if you use Cloudflare or similar.

## 10) Optional fallback mode (static)

A fallback script is available:

```bash
npm run build:static
```

This attempts a static export. Because FeastQR uses authenticated routes, API handlers, and dynamic server features, a full static export may not support all features. Use this only for limited static pages or temporary landing-page style deployments.
