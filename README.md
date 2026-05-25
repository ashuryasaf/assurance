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

## Deployment

### Docker

```bash
docker build -t ashuri .
docker run -p 3000:3000 \
  -e SESSION_SECRET="$(openssl rand -base64 32)" \
  -v ashuri-data:/app/data \
  ashuri
```

### Railway / nixpacks

`nixpacks.toml` calls `node scripts/start.mjs`, which runs `prisma migrate deploy` + `db:seed` (idempotent) before starting Next.js. Set `SESSION_SECRET` (and optionally `DATABASE_URL`) in the project's environment, then mount a persistent volume on `/app/data` if you want uploaded files and the SQLite DB to survive deploys.
