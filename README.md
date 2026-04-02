# 🛡️ Assurance - Digital Insurance Brokerage Platform

> **www.assurance.co.il** | **service@assurance.co.il**

The most advanced digital insurance brokerage platform in Israel. AI-powered policy management, regulatory compliance (רשות שוק ההון), and multi-language support.

## Features

### Core Platform
- **6-Level User Hierarchy**: SuperAdmin → Admin → Agency Owner → Agent → Sub-Agent → Client
- **Agency Management**: Multi-level agencies with sub-agencies and agent teams
- **Full i18n**: Hebrew (עברית), English, Русский, Français, العربية with automatic RTL/LTR

### Insurance & Financial
- **Policy Management**: Life, Health, Car, Home, Pension, Business, Investment, Gemel, Kranot
- **Investment Portfolio**: Performance tracking, allocation charts, returns analysis
- **Banking Connections**: Account linking and balance sync
- **Insurance Marketplace**: Product comparison and quoting

### Israeli Regulatory (רשות שוק ההון)
- **מסלקה פנסיונית** — Pension Clearing House data
- **הר הביטוח** — National insurance database
- **גמל נט** — Provident and training funds
- **הר הכסף** — Lost money finder
- **AI Insights** on all regulatory data

### AI & Document Processing
- **AI Assistant**: Context-aware chat for insurance, investments, regulatory queries
- **Document Upload & AI Analysis**: PDF, Excel, ZIP, images with OCR and insights
- **Digital Signature (V-Sign)**: Canvas-based e-sign with full workflow
- **Audio/Video Recording**: Call recording with transcription

### Reporting & Analytics
- **BI Dashboard**: Premium trends, policy distribution, investment performance
- **Agent Performance**: Revenue, clients, performance metrics
- **Regulatory Reports**: רשות שוק ההון compliant reporting
- **Export**: PDF, Excel, HTML

### Architecture
- **5 UML Diagrams** built-in: System Architecture, User Hierarchy, Data Flow, Deployment, Entity Relationship

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16.2.2 |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 5 |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Deployment | Railway (Docker) |
| Build | Standalone output |

---

## Railway Deployment

### Quick Deploy

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template)

### Manual Setup

1. **Create a new project** on [Railway](https://railway.app)

2. **Connect your GitHub repo**:
   ```
   https://github.com/ashuryasaf/assurance
   ```

3. **Railway auto-detects** the `Dockerfile` and deploys. No additional configuration needed.

4. **Add services** (optional, for full production):
   - Click **+ New** → **Database** → **PostgreSQL** (auto-injects `DATABASE_URL`)
   - Click **+ New** → **Database** → **Redis** (auto-injects `REDIS_URL`)

5. **Set environment variables** in the Railway dashboard (Variables tab):

   **Required for production:**
   ```
   NEXT_PUBLIC_APP_URL=https://your-domain.railway.app
   JWT_SECRET=<generate-a-32-char-secret>
   ```

   **Optional integrations:**
   ```
   OPENAI_API_KEY=sk-...          # AI analysis
   SMTP_HOST=...                   # Email notifications
   S3_BUCKET=...                   # Document storage
   MASLAKA_API_KEY=...            # מסלקה פנסיונית
   HAR_BITUACH_API_KEY=...        # הר הביטוח
   GAMAL_NET_API_KEY=...          # גמל נט
   ```

6. **Custom domain** (optional):
   - Settings → Networking → Custom Domain
   - Add `www.assurance.co.il`
   - Update DNS CNAME to Railway's provided value

### Health Check

The app exposes `/api/health` which Railway uses to verify deployment:
```bash
curl https://your-app.railway.app/api/health
```

Response:
```json
{
  "status": "ok",
  "service": "assurance",
  "version": "0.1.0",
  "checks": {
    "app": "healthy",
    "database": "configured",
    "redis": "configured"
  }
}
```

### Railway Configuration Files

| File | Purpose |
|------|---------|
| `railway.json` | Service config, health check, restart policy |
| `Dockerfile` | Multi-stage production build |
| `nixpacks.toml` | Fallback build config (if not using Docker) |
| `.env.example` | Full list of environment variables |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Email | Role | Password |
|-------|------|----------|
| `admin@assurance.co.il` | מנהל על (SuperAdmin) | `Demo1234!` |
| `agency@assurance.co.il` | בעל סוכנות (Agency Owner) | `Demo1234!` |
| `agent@assurance.co.il` | סוכן (Agent) | `Demo1234!` |
| `sub@assurance.co.il` | סוכן משנה (Sub-Agent) | `Demo1234!` |
| `demo@assurance.co.il` | לקוח (Client) | `Demo1234!` |
| Any `email@domain` | לקוח (Client) | `Demo1234!` |

---

## Project Structure

```
src/
├── app/
│   ├── api/health/          # Health check endpoint
│   ├── (auth)/
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   └── invite/[token]/  # Invite registration
│   ├── dashboard/
│   │   ├── page.tsx          # Main dashboard
│   │   ├── policies/         # Policy management
│   │   ├── documents/        # Document upload & AI analysis
│   │   ├── regulatory/       # מסלקה, הר הביטוח, גמל נט
│   │   ├── investments/      # Investment portfolio
│   │   ├── marketplace/      # Insurance marketplace
│   │   ├── reports/          # BI & advanced reports
│   │   ├── esign/            # Digital signature
│   │   ├── ai-assistant/     # AI chat assistant
│   │   ├── agency/           # Agency & agent management
│   │   ├── affiliates/       # Affiliate program
│   │   ├── banking/          # Bank connections
│   │   ├── recordings/       # Audio/video recording
│   │   ├── architecture/     # UML diagrams
│   │   └── profile/          # User profile & settings
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── dashboard/            # AI assistant bar
│   ├── layout/               # Sidebar navigation
│   └── ui/                   # Language switcher
├── contexts/
│   ├── AuthContext.tsx        # Authentication & user hierarchy
│   └── LanguageContext.tsx    # i18n (HE/EN/RU/FR/AR)
└── lib/
    ├── types.ts              # TypeScript types & role system
    ├── mockData.ts           # Demo data & AI responses
    └── translations.ts       # Translation strings
```

---

## License

AGPL-3.0 — See [LICENSE](LICENSE) for details.

---

**Built with ❤️ for the Israeli insurance market**
