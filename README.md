# אשורי סוכנות לביטוח — Ashuri Insurance Agency Portal

A comprehensive Israeli insurance agency client portal built with Next.js 16, TypeScript, Tailwind CSS, Prisma, and SQLite.

## Features

- **🇮🇱 Hebrew-first RTL interface** with full support for English, Russian, French, and Arabic
- **🔐 Secure server-side auth** — bcrypt password hashing, signed JWT session cookies, and route-level protection via Next.js Proxy
- **🤖 AI assistant** — answers personal queries grounded in the user's own database records (policies, regulatory feeds, investments, documents, affiliates)
- **📋 Policy management** — view, create, update and remove insurance policies (CRUD via REST API)
- **📁 Document repository** — upload, store and download documents from persistent disk storage
- **✍️ Digital eSign (vsign)** — capture canvas signatures and persist them server-side with audit metadata
- **🛒 Insurance marketplace** — browse insurance products served from the database
- **📊 Reports & analytics** — generate reports and view aggregated BI charts derived from real data
- **🔗 Israeli regulatory data** — מסלקה, הר הביטוח, גמל נט snapshots stored per-client and refreshable
- **🎨 Majestic deep blue design** inspired by classic Israeli insurance aesthetics

## Tech Stack

- **Next.js 16** (App Router, Proxy file convention)
- **TypeScript** + **React 19**
- **Tailwind CSS v4**
- **Prisma 7** ORM with **SQLite** (`@prisma/adapter-better-sqlite3`)
- **jose** for JWT session signing, **bcryptjs** for password hashing
- **Zod** for request validation

## Getting Started

```bash
npm install                # generates Prisma client via postinstall
cp .env.example .env       # then edit SESSION_SECRET
npx prisma migrate deploy  # creates ./data/app.db
npm run db:seed            # seeds demo users, policies, documents, etc.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

### Demo credentials

All seeded users share the password **`Demo1234!`**:

| Email | Role |
|-------|------|
| `admin@assurance.co.il` | Super admin |
| `agency@assurance.co.il` | Agency owner |
| `agent@assurance.co.il` | Agent |
| `sub@assurance.co.il` | Sub-agent |
| `demo@assurance.co.il` | Client (demo) |

## Database & migrations

The persistent layer lives in `./data/app.db` (SQLite). Connection details are in `.env`:

```env
DATABASE_URL="file:./data/app.db"
SESSION_SECRET="..."   # 32+ byte random string (openssl rand -base64 32)
```

Useful npm scripts:

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate`  | Create + apply a new migration in development |
| `npm run db:deploy`   | Apply pending migrations (production) |
| `npm run db:reset`    | Drop and reseed the database (destructive) |
| `npm run db:seed`     | Idempotent seed of demo data |

`npm start` (and the Docker / nixpacks containers) automatically run `prisma migrate deploy` and the seed before launching Next.js. Set `SKIP_SEED=1` to skip seeding.

### Operator CLI (recover / create accounts)

Run any of these inside the container (`railway run`, `docker exec`, or any
shell where `node_modules` is installed). They talk directly to the same
SQLite database the app uses, so they work even when the UI login is broken:

| Script | What it does |
|--------|--------------|
| `npm run admin:list-users` | Print every user with role + last-login |
| `npm run admin:reset-password -- <email> <newPassword>` | Hash + persist a new password (also re-enables disabled accounts) |
| `npm run admin:create-admin -- <email> <password> [first] [last]` | Create or promote a `super_admin` |
| `npm run admin:promote -- <email> <role>` | Change role (super_admin / admin / agency_owner / agent / sub_agent / client) |

Useful when the seed didn't run, the demo password was rotated, or you just
need a fresh admin in production. Example:

```bash
railway run npm run admin:create-admin -- you@example.com 'StrongPass!2026' Asaf Ashury
railway run npm run admin:list-users
```

### Health & setup diagnostics

`GET /api/health` now reports the runtime setup state and is the easiest way
to debug a deployment:

```json
{
  "status": "ok",
  "setup": {
    "databaseConnected": true,
    "databaseUrlSet": true,
    "userCount": 5,
    "leadCount": 6,
    "sessionSecretSource": "env",
    "sessionSecretEnvSet": true
  },
  "warnings": []
}
```

`status` is `degraded` (HTTP 503) when the DB is unreachable or has zero
users. Any actionable misconfiguration shows up in `warnings`.

## Routes

### Pages

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Client login |
| `/register` | New client registration |
| `/invite/[token]` | Invitation-link registration |
| `/dashboard` | Client dashboard |
| `/dashboard/policies` | My insurance policies |
| `/dashboard/documents` | Document repository |
| `/dashboard/regulatory` | Maslaka / Har HaBituach / Gamal-Net |
| `/dashboard/investments` | Investment portfolio |
| `/dashboard/marketplace` | Buy new insurance products |
| `/dashboard/reports` | Reports & analytics |
| `/dashboard/esign` | Digital signature (vsign) |
| `/dashboard/banking` | Bank connections |
| `/dashboard/recordings` | Audio / video recordings |
| `/dashboard/agency` | Agency administration (agents+) |
| `/dashboard/affiliates` | Affiliate program (agents+) |
| `/dashboard/ai-assistant` | Full AI chat |
| `/dashboard/profile` | Account settings & language selector |

### REST API

All routes return JSON. Mutating routes require an active session cookie.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/auth/login` | Sign in with email + password |
| `POST` | `/api/auth/register` | Public client registration |
| `POST` | `/api/auth/logout` | Destroy session |
| `GET` / `PATCH` | `/api/auth/me` | Read or update current user |
| `POST` | `/api/auth/password` | Change password |
| `POST` / `PUT` | `/api/auth/invite` | Issue (agent+) or consume invite |
| `GET` / `POST` | `/api/policies` | List / create policies |
| `GET` / `PATCH` / `DELETE` | `/api/policies/:id` | Read, edit, remove |
| `GET` / `POST` | `/api/documents` | List or upload (multipart) |
| `GET` / `PATCH` / `DELETE` | `/api/documents/:id` | Detail / metadata / delete |
| `GET` | `/api/documents/:id/file` | Download original |
| `POST` | `/api/documents/:id/sign` | Attach an e-signature |
| `GET` / `POST` | `/api/reports` | List / generate |
| `GET` / `POST` | `/api/regulatory` | Read / refresh per-client regulatory feed |
| `GET` | `/api/agencies` | List agencies in scope |
| `GET` / `POST` | `/api/affiliates` | List / create affiliate |
| `GET` / `POST` | `/api/banking` | List / connect bank |
| `POST` | `/api/banking/:id/sync` | Trigger a sync |
| `GET` | `/api/investments` | Investment portfolio |
| `GET` / `POST` | `/api/recordings` | List / upload (multipart) |
| `POST` | `/api/ai/chat` | Conversational assistant grounded in DB |
| `GET` | `/api/marketplace` | Public product catalogue |
| `GET` | `/api/dashboard/summary` | Aggregated stats for the home dashboard |
| `GET` | `/api/dashboard/agent` | Agent performance (agents+) |
| `GET` | `/api/health` | Liveness probe |

### Authorization

The Next.js Proxy (`src/proxy.ts`) gates `/dashboard/*` and redirects unauthenticated requests to `/login`. Authenticated visitors hitting `/login` or `/register` are redirected to `/dashboard`.

Server-side authorization lives in `src/lib/dal.ts` (`requireUser`, `requireRole`) and `src/lib/scope.ts` (`canAccessClient`, `clientScopeIdsFor`). Clients can only see their own records; sub-agents/agents can see clients in their agency; admins see everything.

## File storage

Uploaded documents and recordings are stored on disk under `./data/uploads/<random>/<filename>`. The path is recorded as `Document.storagePath` and is served back through `/api/documents/:id/file` after re-checking authorization. Mount `./data` on a persistent volume in production.

## Multi-language support

Supported languages: **עברית** (Hebrew), **English**, **Русский** (Russian), **Français** (French), **العربية** (Arabic).

Language can be changed from the header, sidebar, or profile settings page.

### Sessions / login

Sessions are signed with `SESSION_SECRET`. Recommended setup is to provide it
via the platform's environment (32+ random bytes — `openssl rand -base64 32`).

If `SESSION_SECRET` is **not** set in env, the app generates a random secret
on first request and persists it under `./data/.session-secret` (mode `0600`).
This is what keeps the login working on a clean Railway deploy without manual
configuration; it also survives restarts as long as the data volume sticks
around. The `warnings` field of `/api/health` will tell you when this fallback
is in effect so you can promote it to a real env-managed secret.

If neither the env var nor a writable data directory is available the app
falls back to a process-lifetime random key — sessions then invalidate on
every restart. Mount a volume on `/app/data` (or set `SESSION_SECRET`) to
make this go away.

## Deployment

### Docker

```bash
docker build -t ashuri .
docker run -p 3000:3000 \
  -e SESSION_SECRET="$(openssl rand -base64 32)" \
  -v ashuri-data:/app/data \
  ashuri
```

The image intentionally does **not** declare a Docker `VOLUME` instruction
because Railway rejects that directive at build validation time. Mount
persistence yourself: pass `-v <name>:/app/data` to `docker run`, or attach a
Railway Volume on the `/app/data` path.

### Railway / nixpacks

`nixpacks.toml` calls `node scripts/start.mjs`, which runs `prisma migrate deploy` + `db:seed` (idempotent) before starting Next.js. Set `SESSION_SECRET` (and optionally `DATABASE_URL`) in the project's environment, then attach a **Railway Volume** mounted at `/app/data` so uploaded files and the SQLite DB survive deploys (do not use a Dockerfile `VOLUME` directive — Railway rejects it during build validation).
