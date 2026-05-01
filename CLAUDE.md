# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint

npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to the database (no migration file)
npx prisma migrate dev --name <name>  # Create and apply a named migration
npx prisma studio    # Open Prisma GUI
```

No test suite is configured yet.

## Environment Variables

Required in `.env`:
```
DATABASE_URL=          # PostgreSQL (Neon serverless recommended)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
```

## Architecture

### Layered backend pattern

Every domain on the server follows a strict 3-layer chain — **API route → handler → service → repository**. Nothing in a route file calls Prisma directly; nothing in a repository contains business logic.

```
src/app/api/<domain>/route.ts         ← HTTP in/out only
src/server/<domain>/<domain>.handler.ts  ← error wrapping, returns {status, body}
src/server/<domain>/<domain>.service.ts  ← business logic
src/server/<domain>/<domain>.repository.ts  ← Prisma queries only
src/server/db/client.ts               ← singleton Prisma client (Neon adapter)
```

### Feature-based frontend pattern

Frontend domain code lives in `src/features/<domain>/` and is the only place that may call API routes or own hooks/components for that domain. Features export via a barrel `index.ts`.

```
src/features/<domain>/
  components/   ← UI components (client components)
  hooks/        ← data-fetching hooks (useEffect + fetch)
  api/          ← fetch wrappers for /api/<domain>
  index.ts      ← barrel re-export
```

### Routing

- `src/app/(auth)/` — public routes (sign-in, sign-up) via Clerk's catch-all pages
- `src/app/(dashboard)/` — protected app routes; layout handles user-DB sync on first login
- `src/app/api/` — API routes, protected implicitly by middleware
- `src/middleware.ts` — redirects unauthenticated users to `/sign-in` for all non-public routes

### App shell

`AppLayout` (`src/features/app-shell/AppLayout.tsx`) is a **client component** that owns the collapsible sidebar state. It renders `Sidebar`, `Header`, and `SidebarToggle`. The `SidebarToggle` lives at the `AppLayout` level (not inside Sidebar or Header) so it can straddle the layout boundary.

### Database

Prisma with the `@prisma/adapter-neon` serverless adapter. The schema defines `Campaign`, `Metric`, `Insight`, `User`, and `Workspace`.

### UI components

shadcn/ui components live in `src/components/ui/`. Add new ones with `npx shadcn add <component>`. The project uses the `radix-nova` style with `neutral` base color and CSS variables (configured in `components.json`).

## Folder Structure

```
src/
│
├── app/                                    # Next.js App Router
│   ├── (auth)/                             # Public authentication routes
│   │   ├── layout.tsx                      # Full-screen centered wrapper
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── (dashboard)/                        # Protected app routes
│   │   ├── layout.tsx                      # User-DB sync on first login, wraps AppLayout
│   │   └── page.tsx                        # Dashboard home
│   │
│   ├── api/
│   │   └── campaigns/route.ts              # GET + POST /api/campaigns
│   │
│   ├── globals.css
│   └── layout.tsx                          # Root layout — ClerkProvider
│
├── components/
│   └── ui/                                 # shadcn/ui primitives (badge, button, card, dialog, input, label, table)
│
├── features/                               # Frontend domain modules
│   ├── app-shell/                          # App UI shell
│   │   ├── AppLayout.tsx                   # Sidebar + header + toggle wrapper
│   │   └── components/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── SidebarToggle.tsx
│   │
│   └── campaigns/                          # Campaigns feature (frontend)
│       ├── api/campaigns.api.ts            # fetch wrappers → /api/campaigns
│       ├── components/
│       │   ├── CampaignList.tsx
│       │   └── CampaignTable.tsx
│       ├── hooks/useCampaigns.ts
│       └── index.ts                        # Barrel re-export
│
├── lib/
│   └── utils.ts                            # cn() helper (clsx + tailwind-merge)
│
├── middleware.ts                            # Clerk auth — redirects unauthenticated to /sign-in
│
└── server/                                 # Backend domain modules
    ├── campaigns/
    │   ├── campaigns.handler.ts            # Error wrapping, returns {status, body}
    │   ├── campaigns.repository.ts         # Prisma queries only
    │   └── campaigns.service.ts            # Business logic
    └── db/
        └── client.ts                       # Prisma singleton (Neon adapter)
```
## Tech Stack

* Next.js (App Router)
* Tailwind CSS
* shadcn/ui
* PostgreSQL (Neon recommended)
* Prisma ORM
* OpenAI API
* Clerk (Authentication: Email, Google, Apple)

