# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chore Buddy is a family chore management web app where parents assign chores to kids, track completion, and manage a points-and-rewards system. Built with Next.js 15 (App Router), TypeScript, SQLite (via Prisma), NextAuth.js, and Tailwind CSS.

## Commands

```bash
npm run dev              # Dev server at localhost:3000
npm run build            # Production build
npm run lint             # ESLint
npm run type-check       # TypeScript checking
npm run check            # Both type-check and lint
npm test                 # Jest tests
npm run test:watch       # Jest watch mode
npx prisma migrate dev   # Run database migrations
npx prisma studio        # Database browser GUI
```

Docker dev: `./docker-dev.sh` or `npm run docker:dev`

## Architecture

### Server Actions (not REST APIs)

All data operations use Next.js Server Actions in `app/api/{domain}/actions.ts` (chores, profiles, rewards, points, auth). These use `'use server'` and call Prisma directly. There are no traditional API routes (except the NextAuth catch-all at `app/api/auth/[...nextauth]/route.ts`).

### Authentication & Middleware

- NextAuth.js (v5/Auth.js) with Credentials provider (email/password + bcrypt)
- JWT-based sessions configured in `lib/auth.ts`
- Middleware in `middleware.ts` uses `auth()` to protect routes
- Protected routes: `/parent/*`, `/kid/*`, `/profile/select`
- After login, users pick a profile (Netflix-style selector) → profile ID stored in sessionStorage (`selected_profile_id`)
- Two separate dashboards: parent (`/parent/*`) and kid (`/kid/*`)

### Database

- SQLite via Prisma ORM — database is a local file (`prisma/dev.db`)
- Schema defined in `prisma/schema.prisma`
- Prisma Client singleton in `lib/db.ts`
- Authorization checks done in application code (each server action verifies family membership)

### Data Model

- Multi-tenant by family with application-level authorization
- **Points are a transaction ledger** — balance = SUM(amount) from `points_transactions`, not stored on profiles
- Chore workflow: `not_started` → `in_progress` → `done` → `pending_review` → `completed` (parent approval awards points)
- Reward workflow: `requested` → `approved` → `redeemed` (or `rejected`)

### Type Mapping

Prisma returns camelCase fields matching TypeScript types in `types/index.ts`. Date fields are converted to ISO strings in server actions. Prisma generates its own types automatically.

### Styling

Tailwind CSS with custom color palette (primary=blue, secondary=purple, success=green) defined in `tailwind.config.ts`. Dark mode via `darkMode: 'class'`. Utility function `cn()` from `lib/utils/index.ts` merges class names.

### Component Pattern

Server Components by default; `'use client'` only where needed. Reusable UI primitives in `components/ui/`. Feature components live alongside their pages.

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — SQLite connection string (e.g., `file:./dev.db`)
- `AUTH_SECRET` — Secret for NextAuth.js session encryption
- `NEXT_PUBLIC_APP_URL` — App URL (default: `http://localhost:3000`)
