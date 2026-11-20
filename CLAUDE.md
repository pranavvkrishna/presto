# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project

A **UCI-only campus rental web app** (working name: Presto). Students rent everyday items from each other (vacuums, pumps, tools, speakers, projectors, ring lights) and discover what UCI already lends for free. Built for UCI's Stella Zhang New Venture Competition and the Butterworth Product Development Competition.

**The full product spec is in `TECH_SPEC.md`. Read it before starting any feature.** Requirement IDs (e.g., `RENT-2`, `AUTH-1`) come from that file — reference them in commits and PRs.

## Tech stack

- Next.js 15 (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase: Postgres, Auth (email OTP / magic link), Storage, Realtime
- Zod for validation, React Hook Form for forms
- Resend for email
- Vitest (unit) + Playwright (e2e)
- Deployed on Vercel

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Vitest
npm run test:e2e     # Playwright
npx supabase start   # local Supabase (Docker)
npx supabase db reset            # reset local DB, run migrations + seed
npx supabase migration new <name> # new SQL migration
npx supabase gen types typescript --local > src/types/database.ts
```

If a script doesn't exist yet, add it to `package.json` when setting up.

## Project structure

```
src/
  app/                 # routes (see TECH_SPEC §8)
    (public)/          # login, rules
    (app)/             # signed-in app
    admin/             # admin-only
  components/          # UI components (shadcn in components/ui)
  lib/
    supabase/          # server + browser clients
    rentals/
      transitions.ts   # THE ONLY place rental status changes
      pricing.ts       # fee calculations (TECH_SPEC §7)
    validation/        # Zod schemas
    analytics.ts       # trackEvent()
  types/database.ts    # generated Supabase types
supabase/
  migrations/          # SQL migrations (schema + RLS)
  seed.sql             # demo seed data (TECH_SPEC §14)
tests/
  unit/
  e2e/
```

## Non-negotiable rules

1. **UCI emails only.** Enforce `@uci.edu` in the form, the server action, AND the database/auth hook.
2. **Row-level security on every table.** Every new table ships with RLS policies in the same migration. Never use the Supabase service-role key in client code; only in server code that truly needs it.
3. **Rental status changes only go through `lib/rentals/transitions.ts`.** It checks the actor's permission and the allowed transition (TECH_SPEC `RENT-2`), runs in one transaction, and writes a `rental_events` row.
4. **Money is integer cents.** All fee math lives in `lib/rentals/pricing.ts`, has unit tests, and is used by both UI previews and server writes.
5. **Never expose emails or phone numbers** in public UI or API responses.
6. **Condition and report photos are private** (private bucket + signed URLs).
7. **Never say "insurance."** Use "protection fee" / "repair fund".
8. **No secrets in git.** Use `.env.local`; keep `.env.example` updated with variable names only.
9. **Schema changes = new migration file.** Never edit an applied migration; regenerate types after.
10. **Times:** store UTC, display `America/Los_Angeles`.

## Coding conventions

- TypeScript strict; no `any` unless unavoidable and commented.
- Server Components by default; `"use client"` only when needed.
- Mutations via Server Actions with Zod-validated input; return typed results (`{ ok: true, data } | { ok: false, error }`).
- Mobile-first: design at 375px width, then scale up.
- Every page/list has loading, empty, and error states.
- Accessible: labeled inputs, alt text on images, keyboard-usable, sufficient contrast.
- Small, focused components; colocate feature-specific components with their route.
- Track key analytics events with `trackEvent()` (names in TECH_SPEC §12).

## Workflow for each task

1. Read the relevant section(s) of `TECH_SPEC.md` and list the requirement IDs you're implementing.
2. If anything is ambiguous or conflicts with the spec, **ask before building**.
3. Plan briefly: files to add/change, migration needed?, RLS needed?, tests needed?
4. Implement in small steps.
5. Write/update tests (always for pricing, transitions, and RLS-sensitive logic).
6. Run `npm run lint && npm run typecheck && npm test` and fix failures.
7. Summarize what changed, which ACs are met, and anything left open.

## Definition of done

A feature is done when:
- it meets the acceptance criteria in `TECH_SPEC.md`,
- RLS policies exist and are tested for new tables,
- it works at 375px and on desktop,
- loading/empty/error states exist,
- lint, typecheck and tests pass,
- `TECH_SPEC.md` is updated if behavior changed (see below).

## When requirements change

If the team changes a feature, scope, or business rule:
1. Update `TECH_SPEC.md` first (the relevant section + add a row to §16 Change log).
2. Then update code, migrations, and tests to match.
3. Never let code and spec disagree; the spec is the source of truth.

## Current milestone

Start with **M0 Setup** (TECH_SPEC §13), then M1 → M5 in order. Demo freeze target: **2027-02-15**.
Update this line as milestones complete.

## Out of scope (don't build unless asked)

Online payments, delivery, smart lockers, native apps, sublet room listings, non-UCI users.
