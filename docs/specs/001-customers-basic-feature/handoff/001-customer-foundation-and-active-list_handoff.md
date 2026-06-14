# Handoff — Issue 001: Customer Foundation and Active List

> Foundational slice. **Issues 002, 003, and 004 are all blocked by this one** — it
> establishes the schema, validation, types, query keys, RLS, route protection, and
> the Clerk-authenticated Supabase client they all reuse. Build it carefully.

## Current Feature Context

Tenant-scoped customer management for the water-station app. Authenticated +
registered users manage customers belonging to their own tenant; archived
customers (non-null `deleted_at`) are hidden from the active list. Auth is Clerk;
data authorization is Supabase RLS. See `docs/specs/001-customers-basic-feature/prd.md`
for the full PRD (problem, user stories 1–12, permissions, edge cases).

State of the codebase relevant to this slice:
- `src/app/customers/page.tsx` is a placeholder (`<h1>Customers</h1>`).
- Route protection already exists globally in `src/proxy.ts` (Clerk middleware):
  signed-out → `/sign-in`, signed-in-but-unregistered → registration path. The
  `/customers` route is already gated by this middleware — **do not duplicate the
  redirect logic**, just confirm `/customers` is not in `isPublicRoute`.
- **There is no Supabase SDK client in the repo yet.** Registration used a Supabase
  edge function via `axios` + Clerk token (`src/features/registration/...`), not the
  SDK. This issue must create the Clerk-authenticated Supabase browser client that
  all customer queries/mutations use.
- TanStack Query provider is already wired in `src/app/providers.tsx`.

## Exact Issue to Implement

Source of truth: `docs/specs/001-customers-basic-feature/issues/001-customer-foundation-and-active-list.md`
(covers user stories 1, 6, 7, 8, 9, 10, 12).

Build the end-to-end **read path**: a registered user opens the customers area and
sees the active customer list scoped to their tenant, with loading / empty / error
states. Establish the shared customer schema, types, query keys, the Supabase
client, and the RLS **read** policy. Do **not** build create/edit/archive here.

Acceptance criteria — see the issue file. Summary:
- Active list shows only current-tenant customers; archived (`deleted_at` not null)
  excluded by default.
- Explicit empty state (not a blank table) and user-friendly loading/error states.
- Client-side validation + shared read/display types exist.
- RLS blocks cross-tenant reads even if the UI is bypassed.

## Files to Read First

- `docs/CONSTITUTION.md`, `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`, `docs/SECURITY.md`
- `AGENTS.md` (root) — TS/style/Supabase/TanStack/RHF/Zod/shadcn rules
- `docs/specs/001-customers-basic-feature/prd.md` and `REQUIREMENTS.md`
  (REQUIREMENTS.md lines 24–45 contain the **`public.customers` Postgres schema**)
- `docs/specs/001-customers-basic-feature/TASKS.md` (Phase 1–5 task list)
- Existing feature pattern to mirror: `src/features/registration/` —
  `registration.schema.ts`, `registration.types.ts`, `services/registration.service.ts`,
  `hooks/use-complete-registration.ts`, `registration.guards.ts`, and the
  co-located `*.test.ts` files.
- `src/proxy.ts` (route protection), `src/app/providers.tsx` (Query client),
  `src/components/ui/table.tsx` (shadcn table primitive)

## Files Likely to Modify / Create

Follow the feature folder structure in `docs/ARCHITECTURE.md`:

```
src/features/customers/
  customers.schema.ts        # Zod schema + z.infer types (read/display shapes)
  customers.types.ts
  customers.keys.ts          # array query-key factory (customerKeys)
  customers.mapper.ts        # DB row -> display model (e.g. full_address assembly)
  customers.constants.ts
  services/customers.service.ts   # getCustomers() — Supabase SELECT, errors handled
  hooks/use-customers.ts          # useQuery wrapping the service
  components/customers-table.tsx
  components/customers-columns.tsx
  components/customers-page.tsx   # composes table + loading/empty/error states
  index.ts
src/lib/supabase/client.ts   # NEW: Clerk-authenticated Supabase browser client
src/app/customers/page.tsx   # replace placeholder; render the feature page
```
- Possibly `docs/DATABASE.md` (create) — `SECURITY.md` requires every RLS policy
  documented there. It does not exist yet.

## Commands to Run

```sh
bun run test        # vitest run
bun run lint        # eslint
bunx tsc --noEmit   # typecheck (no dedicated script; package.json has no "typecheck")
bun run build       # next build
```
(Repo uses Bun — see `bun.lock`. `npm`/`pnpm` also work if preferred.)

## Tests Required

- Zod schema unit tests (valid/invalid customer read+display shapes), mirroring
  `registration.schema.test.ts`.
- Mapper unit tests (e.g. `full_address` assembly from parts) — see
  `registration.mapper.test.ts` for the pattern.
- Service behavior test (returns rows, throws user-friendly error on Supabase error).
- RLS: verify cross-tenant reads are blocked — manual verification or an
  integration test (TASKS.md Phase 5). Document how it was verified.

## Constraints (AGENTS.md / ARCHITECTURE.md / SECURITY.md)

- **TypeScript strict**: no `any`, no `@ts-ignore`; avoid unsafe `as`/`!`. Use
  `unknown` + narrowing. Exported functions need explicit return types. Infer types
  from Zod via `z.infer`.
- **Style**: single quotes in TS, double quotes in JSX props; kebab-case files;
  PascalCase components/types; camelCase vars.
- **Data flow** (ARCHITECTURE.md): UI → validation → service → Supabase → RLS. All
  Supabase query logic lives in `services/`; query hooks live in `hooks/`.
- **Supabase**: use the SDK (not raw `fetch`) for DB queries; always handle
  `{ data, error }`; never bypass/weaken RLS. Only `NEXT_PUBLIC_*` keys client-side.
  Service role key / DB URL / secrets must never reach the browser.
- **Query keys** are arrays via a key factory (`customerKeys`).
- **Security**: RLS enabled on `customers`; tenant isolation by `tenant_id`; never
  expose internal/raw DB errors to users.
- **Data model nuance**: `created_by` and `tenant_id` are **integer FKs** to
  `public.users(id)` / `public.tenants(id)` — NOT raw Clerk IDs. The Clerk session
  claim `organization` carries tenant context (see `RegistrationSessionClaims` in
  `registration.types.ts`). RLS must map the Clerk identity → local tenant/user.
  Schema changes must use migrations; don't delete columns without approval.

## Done Definition

- `/customers` renders the active, tenant-scoped customer list for a registered
  user, with working loading, empty, and error states; archived rows excluded.
- Schema, types, query-key factory, mapper, service, hook, and Clerk-auth Supabase
  client are in place under `src/features/customers/` + `src/lib/supabase/`.
- RLS read policy enforces tenant isolation (verified) and is documented.
- `test`, `lint`, `tsc --noEmit`, and `build` all pass; no `any`/`@ts-ignore`; no
  secrets exposed.
- Report: files changed, summary, assumptions, commands run, results, manual steps.

## Suggested Skills

- `superpowers:brainstorming` — before coding, to settle the Clerk→Supabase RLS
  mapping and the tenant/`created_by` resolution (foundational, affects all 4 issues).
- A TDD / test-driven skill if available (schema, mapper, and service tests first).
- A spec-driven-development skill if available (AGENTS.md mandates the
  Constitution → Spec → Plan → Tasks → Implementation → Verification → Docs flow).
