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
npm test -- path/to/file.test.ts  # Run a single test file
npx prisma migrate dev   # Run/create database migrations
npx prisma studio        # Database browser GUI
npx prisma generate      # Regenerate Prisma Client after schema changes
```

## Architecture

### Server Actions (not REST APIs)

All data operations use Next.js Server Actions in `app/api/{domain}/actions.ts` (chores, profiles, rewards, points) and `app/auth/actions.ts`. These use `'use server'` and call Prisma directly. The only traditional API route is the NextAuth catch-all at `app/api/auth/[...nextauth]/route.ts`.

### Authentication & Middleware

- NextAuth.js (v5/Auth.js) with Credentials provider (email/password + bcrypt), configured in `lib/auth.ts`
- JWT-based sessions; session includes `user.id` via custom callbacks
- Middleware in `middleware.ts` uses `auth()` to protect routes: `/parent/*`, `/kid/*`, `/profile/select`
- After login, users pick a profile (Netflix-style selector) → profile ID stored in sessionStorage (`selected_profile_id`)
- Two separate dashboards: parent (`/parent/*`) and kid (`/kid/*`)

### Authorization Pattern in Server Actions

Every server action that reads/writes family data must:
1. Call `auth()` to get the session and `user.id`
2. Look up the user's profile to get their `familyId` (or call `getCurrentFamilyId()` from `app/api/profiles/actions.ts`)
3. Scope all Prisma queries to that `familyId`

There is no database-level row security — authorization is enforced entirely in application code.

### Database

- SQLite via Prisma ORM — database file at `prisma/dev.db`
- Schema in `prisma/schema.prisma`; Prisma Client singleton in `lib/db.ts`
- Enums (roles, statuses, reasons) are stored as plain strings in SQLite since it lacks native enums
- Models use `@@map("snake_case")` table names but camelCase field names in Prisma

### Data Model

- Multi-tenant by family with application-level authorization
- **Points are a transaction ledger** — balance = SUM(amount) from `points_transactions`, not stored on profiles
- Chore workflow: `not_started` → `in_progress` → `done` → `pending_review` → `completed` (parent approval awards points)
- Reward workflow: `requested` → `approved` → `redeemed` (or `rejected`)

### Type Conventions

- Domain types are in `types/index.ts` (e.g., `Profile`, `Chore`, `Reward`) with string-typed dates
- Prisma returns `DateTime` as JS `Date` objects; server actions convert to ISO strings via `.toISOString()` before returning to components
- Status/role fields use TypeScript string literal union types (e.g., `ChoreStatus`, `ProfileRole`) in `types/index.ts`, but Prisma stores them as plain strings — cast when mapping (e.g., `data.status as RewardRedemption['status']`)
- Path alias: `@/*` maps to project root (e.g., `import { prisma } from '@/lib/db'`)

### Styling

Tailwind CSS with custom color palette (primary=blue, secondary=purple, success=green) in `tailwind.config.ts`. Dark mode via `darkMode: 'class'`. Utility function `cn()` from `lib/utils/index.ts` merges class names.

### Component Pattern

Server Components by default; `'use client'` only where needed. Reusable UI primitives in `components/ui/`. Client components that need data use server action imports or receive data as props.

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — SQLite connection string (e.g., `file:./dev.db`)
- `AUTH_SECRET` — Secret for NextAuth.js session encryption
- `NEXT_PUBLIC_APP_URL` — App URL (default: `http://localhost:3000`)
