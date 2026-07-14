# Testing and Operations

Companion to [`11-quality-and-improvements.md`](./11-quality-and-improvements.md)
(quality findings) and [`05-codebase-map.md`](./05-codebase-map.md) (structural
facts). This file is the operational reference: how to test, build, and run
this repo, and what operational tooling exists vs. is absent.

---

## Test framework

**Vitest** (`vitest@4.1.8`). **Confirmed** — `docs/TESTING.md`, `vitest.config.ts`, `package.json`.

Config (`vitest.config.ts`):

```ts
{
  test: { environment: 'node', include: ['src/**/*.{test,spec}.{ts,tsx}'] },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
}
```

- `environment: 'node'` — **no DOM**. No `jsdom`/`happy-dom`, no
  `@testing-library/react` in `package.json` (**Confirmed**, checked
  `dependencies`/`devDependencies`). This means **no test in the repo renders
  a React component**; all tests exercise pure TS/schema/mapper/guard/service
  logic. See Q17 in `11-quality-and-improvements.md` for the improvement
  angle.
- No coverage config (no `coverage` block in `vitest.config.ts`, no
  `@vitest/coverage-v8`/`istanbul` in devDependencies). **There is no coverage
  reporting today** — pass/fail count is the only signal.

## Test categories and locations found

Per `docs/TESTING.md`, feature tests belong in
`src/features/[feature]/tests/`. Actual state (**Confirmed**, full repo glob
for `*.test.ts`/`*.test.tsx`):

| Feature | Tests folder | Test files | What they cover |
|---|---|---|---|
| `customers` | `tests/` (+ 1 in `services/`) | 10 files | Schema, mapper (3 files: base/insert/form-values), guards, keys, create/update/archive service, `use-mutation-dialog` hook |
| `products` | `tests/` | 4 files | Schema, mapper, guards, keys, service |
| `expenses` | `tests/` | 3 files | Form schema, mapper, summary logic, service |
| `deliveries` | `tests/` | 14 files | Schema, pagination, recurrence, transitions, mapper, schedule-mapper, schedule-view, and one service test per operation (create/edit/history/materialize/queue/schedule-admin/schedule-list/schedule/status) — the deepest test coverage in the repo, matching its status as the most complex domain (recurrence + stock deduction) |
| `maintenance` | **none** — one flat `maintenance.test.ts` at feature root | 1 file | Some coverage exists but not per-unit; **gap** relative to the `tests/` convention |
| `documents` | **none** | 0 | No automated tests at all — approval flow, soft-delete, and visibility logic are untested |
| `notifications` | **none** | 0 | No automated tests — realtime subscription merge/dedupe logic and column-locked update behavior are untested |
| `registration` | colocated beside source, not in `tests/` | 3 files | Guards, mapper, schema — drift from the documented convention |
| `aquaflow-ai` | `tests/` | 4 files | Guards, mapper, schema, service |
| `landing`, `legal`, `playground` | none | 0 | No data layer / presentational only (landing, legal) or scratch module (playground) — **Requires validation** whether playground needs tests before being treated as production |
| (non-feature) | `src/lib/supabase/client.test.ts` | 1 file | Shared Supabase client factory |
| (non-feature) | `src/app/api/aquaflow-ai-mock/route.test.ts` | 1 file | The one Route Handler in the repo (mock AI endpoint) |

**Totals this pass**: 48 test files, 208 tests, all passing (see Commands
Run below).

## What's tested vs. not, by category

- **Zod schema validation**: covered for customers, products, expenses,
  deliveries, aquaflow-ai, registration. **Not covered**: documents,
  notifications, maintenance (partial, in the flat file).
- **Mappers**: same coverage pattern as schemas.
- **Query key factories**: covered for customers, products. **Not
  covered** elsewhere (lower risk — key factories are simple and stable).
- **Guards/permission helpers**: covered for customers, products, aquaflow-ai,
  registration (`isRegistered()`). **Not covered**: documents, notifications,
  maintenance. Note per Q08 (`11-quality-and-improvements.md`) that most
  feature guard files today only express ownership/lifecycle checks, not
  role-aware (owner vs staff) rules — so there is little role-based guard
  logic to test yet outside `registration`.
- **Supabase service behavior with mocked clients**: the dominant test
  pattern (hand-built chained client, each method a `vi.fn()` returning the
  next link, terminating in `Promise.resolve({ data, error })` — see
  "Mocking strategy" below). Covered for customers, products, expenses,
  deliveries (extensively), aquaflow-ai. **Not covered**: documents,
  notifications.
- **Mutation invalidation behavior**: covered narrowly (`use-mutation-dialog.test.ts`
  in customers) rather than per-mutation-hook; most mutation hooks
  (`use-create-x.ts` etc.) are thin enough that the review in
  `11-quality-and-improvements.md` (Q09) suggests collapsing them before
  writing per-hook tests for each one.
- **Critical component/UI flows**: **not tested at all** anywhere — no
  `jsdom`, no React Testing Library (see Test framework section). Manual
  verification is the only coverage per `docs/TESTING.md`.
- **Acceptance / integration / E2E tests**: **none found** — no Playwright,
  Cypress, or similar in `package.json`. `docs/specs/*/ACCEPTANCE.md` files
  exist per feature (e.g. `docs/specs/001-customers-basic-feature/ACCEPTANCE.md`,
  `docs/specs/003-expenses/ACCEPTANCE.md`, `docs/specs/008-build-maintenance-module/ACCEPTANCE.md`)
  but these are **manual acceptance-criteria documents**, not automated
  acceptance tests.
- **DB/RLS tests**: **none automated** — by design. `docs/TESTING.md`
  explicitly assigns RLS tenant isolation, Clerk claim behavior, cross-org
  access, and owner/staff differences to **manual verification**, documented
  per-table in `docs/DATABASE.md` (each table section has a "Manual RLS
  verification" numbered checklist). This is a deliberate project convention,
  not a gap — there is no local Postgres/Supabase test instance in the repo
  to run automated RLS tests against (no `supabase/` folder at all, per
  `05-codebase-map.md` §1/§17).
- **Security tests**: none automated beyond what Zod/service tests
  incidentally cover (e.g. asserting `org_id`/`created_by` come only from the
  `owner` object, never form input, in mapper tests). Manual RLS checklists
  are the actual security test suite.

## Mocking strategy

**Confirmed** pattern (read directly from
`src/features/customers/tests/customer-create.service.test.ts` and
corroborated by `docs/improve-architecture/CODEBASE.md` §13): build a fake
`SupabaseClient`-shaped object where each chain method (`.from()`, `.select()`,
`.insert()`, `.is()`, `.eq()`, `.order()`, `.single()`, …) is a `vi.fn()`
returning an object exposing the next method in the chain, terminating in a
`Promise.resolve({ data, error })` (or a rejected/error-shaped resolution for
the failure-path test). **No real Supabase network calls occur in any test.**
Both the happy path (correct table/columns/filter, data mapped through the
Zod schema) and the failure path (raw error swallowed, friendly constant
message thrown instead) are asserted per service function.

There is no MSW, nock, or HTTP-mocking library in the repo — unnecessary
since no test crosses a network boundary; the one Route Handler test
(`route.test.ts`) exercises the handler function directly, not over HTTP.

## Commands run this pass (results)

| Command | Result | Notes |
|---|---|---|
| `npm run test` (`vitest run`) | **Pass** — 48 test files, 208 tests, 0 failures, ~8.6s | Ran to completion, no flakiness observed |
| `npm run lint` (`eslint`) | **Pass with warnings** — 0 errors, 13 warnings | Warnings: 3× `no-unused-vars` (test/component files), 1× `react-hooks/exhaustive-deps` (×2 in `unified-delivery-form.tsx`), 8× "React Compiler skipped memoization — incompatible library" (React Hook Form's `watch()`, across `documents`, `expenses`, `maintenance`, `products`, `registration` form components) — all pre-existing, none touched or fixed this pass |
| `npx tsc --noEmit` | **Pass** — 0 errors, no output | `tsconfig.json` has `strict: true`; no `typecheck` npm script exists (see Q16 in `11-quality-and-improvements.md`), so this was run directly |
| `npm run dev` / `npm run build` | **Not executed** | Explicitly out of scope for this pass (build/deploy commands with side effects); not required to verify any claim here |

None of the warnings above were fixed, per this task's instructions — they
are recorded as-is for the next agent.

## Coverage configuration

**None.** No coverage thresholds, no coverage script, no CI gate on coverage.
If coverage reporting is wanted, `@vitest/coverage-v8` would need to be added
as a devDependency and a `coverage` block added to `vitest.config.ts` — this
is a new-dependency decision per `docs/AI-GUARDRAILS.md`, not a drop-in.

## Local setup steps

From `README.md` and `package.json` (**Confirmed**):

```bash
npm install
npm run dev      # next dev — local dev server
npm run lint     # eslint
npm run test     # vitest run
npm run build    # next build
npm run start    # next start — serve the production build
```

Environment: a `.env` file exists at the repo root (git-ignored via
`.env*` in `.gitignore`) with the variables listed below. No `.env.example`
file was found in the repo (**Confirmed**, glob) — a new developer/agent has
no template to copy from today.

## Build commands

- `npm run build` → `next build` (Next.js 16.2.7, Turbopack root set in
  `next.config.ts`). **Not executed** this pass (build commands can have side
  effects / are slow; skipped per task scope).
- `npm run start` → `next start`, serves the build output.

No custom build scripts, no bundling steps beyond Next.js's own, no Docker
build.

## Deployment process / CI-CD

**Largely absent / Unknown**:

- No `.github/workflows/*` (**Confirmed**, glob returned nothing) — no CI
  runs lint/test/typecheck automatically on push or PR today.
- No `vercel.json`. `.gitignore` includes a `.vercel` entry, which is the only
  signal pointing at a likely Vercel deployment target — **Inferred, not
  confirmed**. Do not assume Vercel-specific behavior (redirects, headers,
  edge config) is in play without asking the user.
- No Dockerfile, no other IaC.
- No documented rollback process anywhere in `docs/`.

**Practical implication for any agent**: there is no automated gate between a
commit and production. `npm run lint`, `npx tsc --noEmit`, and `npm run test`
passing locally is currently the *only* signal of health before a human
merges/deploys.

## Environment variables (names only — no values recorded)

From the repo's `.env` file (names only; **do not print or log values**):

| Variable | Client-exposed? | Purpose (per `docs/SECURITY.md` / `CONTEXT.md`) |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/publishable key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Yes | Clerk sign-in routing config |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Yes | Clerk sign-up routing config |
| `NEXT_PUBLIC_SUPABASE_EDGE_CREATE_ORG_URL` | Yes | Onboarding edge function URL (owner path), see `CONTEXT.md` Authentication & Onboarding |
| `NEXT_PUBLIC_SUPABASE_EDGE_ADD_STAFF_URL` | Yes | Onboarding edge function URL (staff path) |
| `CLERK_SECRET_KEY` | **No — server-only** | Clerk server SDK secret |
| `GEMINI_API_KEY` | **No — server-only** | Present but `src/app/api/aquaflow-ai-mock/route.ts` is an explicitly-labeled **mock** — **Requires validation** whether this key is actually consumed anywhere yet, or provisioned ahead of a real AI backend integration |

All `NEXT_PUBLIC_*` vars above match the allowed-public list in
`docs/SECURITY.md`/`CLAUDE.md`. No service-role key, database password, or
webhook secret was found in `.env` (**Confirmed** by reading variable names
only). Do not add a var to the client-exposed list without checking
`docs/SECURITY.md` first.

## Monitoring, logging, error reporting

- **None found.** No Sentry, PostHog, LogRocket, Datadog, or any analytics/
  observability dependency in `package.json` (**Confirmed**).
- The only production-visible logging is a `console.log('[Middleware Log]', …)`
  call in `src/proxy.ts`, confirmed active on every request (see
  `03-specification-status.md` row 1) — worth trimming before a production
  hardening pass, but not a correctness concern.
- Error handling ends at user-facing toasts (`src/stores/toast-store.ts`) —
  there is no server-side error aggregation to know a mutation is silently
  failing for a real tenant.

## Backup / recovery / rollback

**Not documented anywhere in the repo.** No `supabase/` migrations folder
means schema changes are applied manually in the Supabase dashboard, guided
by per-feature SQL/markdown files under `docs/specs/*/`
(e.g. `docs/specs/004-deliveries-module/004-deliveries-schema.md`,
`docs/specs/008-build-maintenance-module/maintenance_migration.md`). This
means:

- There is no versioned, replayable migration history — schema state lives
  only in the live Supabase project plus whatever markdown documents it.
- No backup/restore procedure, no point-in-time-recovery notes, no rollback
  script for a bad manual migration are documented.
- **Operational risk**: a manual dashboard migration that diverges from what
  `docs/DATABASE.md` says (see Q02 in the quality doc for a live example of
  this already having happened) has no automated way to be caught.

## Common operational risks (synthesized from the above)

1. **No CI** — nothing stops a broken build/failing test from being merged;
   the only safety net is an agent or human running the commands in this
   file manually.
2. **No error monitoring** — production failures are invisible until a user
   reports them.
3. **Manual-only schema migrations with no rollback path** — a bad dashboard
   change is not easily reversible and can silently desync from
   `docs/DATABASE.md` (see the `org_id` type mismatch documented in
   `03-specification-status.md` row 8 as a live example of this already
   having happened).
4. **Two features (`documents`, `notifications`) have zero automated test
   coverage** — regressions in approval logic or the column-locked realtime
   update path would only surface via manual QA or a user bug report.

---

## Minimum verification checklist (run after any change)

In order, cheapest-first:

1. **`npm run lint`** — must be 0 errors (warnings pre-exist; do not
   introduce new ones without reason).
2. **`npx tsc --noEmit`** — must be 0 errors. (Consider adding the `typecheck`
   script per Q16 before relying on this being remembered.)
3. **`npm run test`** — must stay at 100% pass; add/update tests alongside any
   schema, mapper, guard, keys, or service change per `docs/TESTING.md`, in
   the feature's `tests/` folder.
4. **If the change touches a Supabase table, `org_id`, `created_by`, or
   `deleted_at`**: update `docs/DATABASE.md`'s column/policy tables for that
   table in the same change (`docs/SECURITY.md` requires this), and manually
   re-run that table's "Manual RLS verification" checklist:
   - sign in as a user in org A, confirm the list/detail only shows org A rows
   - attempt a direct cross-org read/write via the Supabase client; confirm
     RLS rejects it
   - confirm soft-deleted rows never appear in active lists
   - if owner/staff behavior differs, verify both roles explicitly
5. **If the change touches `src/proxy.ts` or auth/session logic**: `proxy.ts`
   is confirmed active middleware (see `03-specification-status.md` row 1),
   so re-walk the full sign-in → `/complete-registration` → protected-route
   flow for both a new owner and a new staff account after any change.
6. **If the change touches a form**: manually verify loading, error, empty,
   and populated states (`docs/TESTING.md` requires this; there is no
   automated harness to do it for you, per the Test framework section above).
7. **Do not run `npm run build`/`npm run start` as a default step** unless the
   change plausibly affects the production build (e.g. new env var, new route
   segment config) — it's slower and out of scope for routine verification.
