# אשורי סוכנות לביטוח — Ashuri Insurance Agency Portal

A comprehensive Israeli insurance agency client portal built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- **🇮🇱 Hebrew-first RTL interface** with full support for English, Russian, French, and Arabic
- **🔐 Secure client portal** with registration, login, and invitation-link onboarding
- **🤖 AI assistant** for insurance queries, claims guidance, and savings advice
- **📋 Policy management** — view and manage all insurance policies in one place
- **📁 Document repository** — upload, store, and retrieve all insurance documents
- **✍️ Digital eSign (vsign)** — sign documents electronically with a canvas signature pad
- **🛒 Insurance marketplace** — browse and purchase new insurance products
- **📊 Reports & analytics** — generate annual, policy, pension, and claims reports
- **🔗 Israeli government services** — links to הר הביטוח, הר הכסף, and המסלקה הפנסיונית
- **🎨 Majestic deep blue design** inspired by classic Israeli insurance aesthetics

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **React 19**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo credentials
- Email: `demo@ashuri.co.il`
- Password: `Demo1234!`

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Client login |
| `/register` | New client registration |
| `/invite/[token]` | Invitation-link registration |
| `/dashboard` | Client dashboard with AI assistant |
| `/dashboard/policies` | My insurance policies |
| `/dashboard/documents` | Document repository |
| `/dashboard/marketplace` | Buy new insurance products |
| `/dashboard/reports` | Reports & analytics |
| `/dashboard/esign` | Digital signature (vsign) |
| `/dashboard/profile` | Account settings & language selector |

## Multi-language Support

Supported languages: **עברית** (Hebrew), **English**, **Русский** (Russian), **Français** (French), **العربية** (Arabic)

Language can be changed from the header, sidebar, or profile settings page.
