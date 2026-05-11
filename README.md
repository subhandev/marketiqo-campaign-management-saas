# Marketiqo
 
> AI-powered SaaS that gives marketing agencies and consultants a single workspace to manage clients, run campaigns, and get real strategic insights — powered by AI, built for results. 

---
 
## Features
 
- 🔐 **Auth & Multi-tenancy** — Clerk-powered sign-in (email + social providers); all data scoped per workspace
- 👥 **Client Management** — Full client roster with status tracking, detail pages, and inline editing
- 📣 **Campaign Lifecycle** — Create and manage campaigns from Planned → Active → Completed with budget, goals, and date tracking
- 🤖 **AI Insights** — On-demand AI analysis (OpenAI by default, Groq optional) that generates context-aware recommendations per campaign
- 📊 **Dashboard** — Live workspace metrics: total clients, active campaigns, at-risk flags, and completions at a glance
- 🎨 **Production UI** — Consistent design system with soft status badges, validated forms (RHF + Zod), and Linear-quality polish throughout
 
## Tech stack

- **Framework**: Next.js (App Router), React
- **UI**: Tailwind CSS, shadcn/ui
- **Auth**: Clerk
- **DB**: PostgreSQL (Neon recommended), Prisma ORM
- **AI**: Groq (default) or OpenAI
- **Forms/validation**: React Hook Form, Zod

## Documentation

- **Architecture**: `docs/ARCHITECTURE.md`

## Getting started

### Prerequisites

- Node.js (recommended: current LTS)
- PostgreSQL database (Neon works well)
- A Clerk application (publishable + secret key)
- An AI provider key (Groq default, or OpenAI)

### Install

```bash
npm install
```

### Environment variables

Create `.env.local` in the repo root:

```env
# Database
DATABASE_URL=

# Clerk (Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI provider selection (optional)
# Default is groq when omitted.
AI_PROVIDER=groq

# Optional model override (applies to both providers)
# AI_CHAT_MODEL=

# If AI_PROVIDER=groq (default)
GROQ_API_KEY=

# If AI_PROVIDER=openai
OPENAI_API_KEY=
```

### Database setup (Prisma)

For local/dev, you can push the schema:

```bash
npx prisma generate
npx prisma db push
```

Optional:

```bash
npx prisma studio
```

### Run the app

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

- `npm run dev`: start Next.js dev server (Turbopack)
- `npm run build`: `prisma generate` → `prisma migrate deploy` → `next build`
- `npm run start`: start production server
- `npm run lint`: run eslint

## Repo structure (at a glance)

- `src/app/`: Next.js routes, layouts, and API endpoints
- `src/features/`: feature modules (UI, hooks, `/api/**` wrappers)
- `src/server/`: backend domains (handler/service/repository), Prisma client, workspace logic
- `prisma/schema.prisma`: data model
- `docs/`: project documentation

## Architecture (one-minute summary)

Marketiqo uses:

- **Feature-based frontend**: `src/features/**`
- **Thin API routes**: `src/app/api/**/route.ts` authenticate with Clerk, resolve workspace, then delegate
- **Layered backend**: `handler → service → repository → Prisma`
- **Workspace-scoped tenancy** with a demo workspace mode

For the full end-to-end architecture (including diagrams and extension guidance), see `docs/ARCHITECTURE.md`.

## Status

Active development (MVP).
