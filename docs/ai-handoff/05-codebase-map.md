# Codebase Map

Practical repo map for AI agents working in this repo. This is a navigation
aid, not a design doc — for *why* things are shaped this way, see
`docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`, and
[`06-technical-architecture.md`](./06-technical-architecture.md). For a
feature-by-feature inventory, see `04-feature-map.md` (referenced, not
duplicated here).

Root: `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\water-station-web`

## 1. Top-level tree (evidence: repo listing, **Confirmed**)

```
water-station-web/
├── src/
│   ├── app/                  Next.js App Router routes
│   ├── features/             Domain modules (business logic)
│   ├── components/           Shared/global UI (app-shell, shadcn primitives)
│   ├── hooks/                Shared cross-feature hooks (1 file today)
│   ├── lib/                  Framework-agnostic utilities (Supabase client factory, cn())
│   ├── stores/                Global client/UI state (hand-rolled, see §9)
│   ├── types/                 Global ambient type declarations
│   ├── content/legal/          Static legal copy consumed by legal pages
│   └── proxy.ts                Clerk auth middleware (see §13 — unusual filename)
├── docs/                      Specs, ADRs, architecture docs, this handoff set
├── public/ (if present)        Static assets
├── package.json, tsconfig.json, next.config.ts, eslint.config.mjs,
│   components.json, vitest.config.ts   Project config (see §18)
├── CLAUDE.md                   Root agent-instructions file (stack + workflow rules)
└── .next/, node_modules/, *.tsbuildinfo   Generated — never edit (see §19)
```

There is **no `supabase/` migrations folder** in the repo (**Confirmed** —
`Glob supabase/**` returned no files). Schema changes are authored as SQL in
`docs/specs/*/**.sql` or `docs/specs/*/*.md` and run manually in the Supabase
dashboard; `docs/DATABASE.md` is the living source of truth for tables/RLS.
This is an explicit, documented deviation from a typical Supabase-CLI-managed
repo — **Confirmed** by `docs/DATABASE.md`'s repeated "Migration to run in the
Supabase dashboard (no `supabase/` folder in repo)" notes.

## 2. Purpose of each important directory

| Directory | Purpose | Evidence |
|---|---|---|
| `src/app/(auth)` | Public/unauthenticated routes: sign-in, sign-up | `src/app/(auth)/layout.tsx`, `sign-in/[[...sign-in]]/page.tsx` |
| `src/app/(protected)` | Authenticated + onboarded app routes, wrapped in the sidebar shell | `src/app/(protected)/layout.tsx` |
| `src/app/api` | Next.js Route Handlers — currently one, a **mock** AI endpoint | `src/app/api/aquaflow-ai-mock/route.ts` |
| `src/app/complete-registration` | Onboarding form route (outside both `(auth)`/`(protected)` groups) | `src/app/complete-registration/page.tsx` |
| `src/app/privacy-policy`, `src/app/terms-and-conditions` | Public legal pages, explicitly excluded from auth gating | `src/proxy.ts` (`isLegalRoute`) |
| `src/features/*` | One folder per domain/business module — the bulk of app logic | `docs/ARCHITECTURE.md` §Feature Modules, `docs/improve-architecture/CODEBASE.md` |
| `src/components/app` | Cross-feature app-level UI primitives (modal shell, confirm dialog, toast renderer, submit-confirm hook) | `src/components/app/*` |
| `src/components/layout` | App shell chrome: sidebar, header, auth shell, ocean backdrop | `src/components/layout/*` |
| `src/components/ui` | shadcn/ui primitives (Button, Dialog, DropdownMenu, Input, Label, Table) | `src/components/ui/*`, `components.json` |
| `src/hooks` | Shared hooks used by *every* feature, not feature-specific | `src/hooks/use-clerk-supabase.ts` |
| `src/lib` | Non-React utilities: Supabase client factory, `cn()` | `src/lib/supabase/client.ts`, `src/lib/utils.ts` |
| `src/stores` | Global client/UI state (sidebar collapse, theme, toast queue) | `src/stores/*` — see §9, this is **not** Zustand despite docs saying so |
| `src/types` | Ambient/global TypeScript declarations (Clerk JWT claim shape) | `src/types/globals.d.ts` |
| `src/content/legal` | Markdown/text content rendered by legal pages | referenced by `src/features/legal` |
| `docs/specs/*` | Spec-driven-development folders per feature (prd/REQUIREMENTS/ACCEPTANCE/issues) | `docs/specs/` |
| `docs/adr/*` | Architecture Decision Records — read before touching auth, org/tenant identity, notifications, deliveries/maintenance recurrence | `docs/adr/000x-*.md` |

## 3. App entry points & routing map

Root layout: `src/app/layout.tsx` (loads Poppins font, injects a pre-paint
dark-mode script, wraps everything in `Providers`). `src/app/providers.tsx`
mounts `ClerkProvider` → `QueryClientProvider` → children → `Toaster`.
**Confirmed.**

### `src/app/(auth)` route group

| Route | File | Notes |
|---|---|---|
| `/sign-in/*` | `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Clerk `<SignIn/>` catch-all |
| `/sign-up/*` | `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Clerk `<SignUp/>` catch-all |
| (layout) | `src/app/(auth)/layout.tsx` | Wraps in `AuthShell` (`src/components/layout/auth-shell.tsx`) |
| — | `src/app/(auth)/auth-appearance.ts` | Clerk theming config, not a route |

### `src/app/(protected)` route group

Layout: `src/app/(protected)/layout.tsx` wraps children in
`NotificationsProvider` (mounts the realtime notification subscription once)
then `AppShell` (sidebar + header chrome). **Confirmed.**

| Route | File | Feature module | Status |
|---|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | — | Not yet explored in this pass; treat as **Requires validation** |
| `/customers` | `customers/page.tsx` | `src/features/customers` | Full CRUD, reference blueprint (see `docs/improve-architecture/CODEBASE.md`) |
| `/products` | `products/page.tsx` | `src/features/products` | Full CRUD (spec `docs/specs/002-products`) |
| `/expenses` | `expenses/page.tsx` | `src/features/expenses` | Full CRUD (spec `docs/specs/003-expenses`) |
| `/deliveries` | `deliveries/page.tsx` | `src/features/deliveries` | Recurrence/materialization engine (ADR 0002, 0005 deliveries specs) |
| `/maintenances` | `maintenances/page.tsx` | `src/features/maintenance` | Recurrence via roll-forward, not rolling materialization (ADR 0006) |
| `/documents` | `documents/page.tsx` | `src/features/documents` | Spec `docs/specs/009-build-documents-module` |
| `/sales` | `sales/page.tsx` | **none** | Stub placeholder only — renders a bare `<h1>Sales</h1>`, no feature module wired up. **Confirmed** by reading the file. |
| `/ai-assistant` | `ai-assistant/page.tsx` | `src/features/aquaflow-ai` | **Owner-only route** (ADR 0008); mock backend today (`src/app/api/aquaflow-ai-mock`) |
| `/playground` | `playground/page.tsx` | `src/features/playground` | Appears to be a scratch/demo route — **Requires validation** of intended purpose before treating as production |

Each protected page file is a thin wrapper: `export const dynamic =
'force-dynamic'` + render the feature's top-level `*Page` component.
**Confirmed** (`src/app/(protected)/customers/page.tsx`). This means every
protected route is currently opted out of static rendering/prerendering.

### Standalone routes (outside both groups)

- `/` — `src/app/page.tsx`, marketing landing page composed from
  `src/features/landing/*` sections (`LandingNavbar`, `LandingHero`,
  `ProblemSection`, `FeaturesSection`, `DashboardPreview`, `CtaBand`,
  `LandingFooter`). Public route per `src/proxy.ts`'s matcher (not listed in
  `isPublicRoute`, but the root path comment `// '/'` is commented out —
  **Requires validation**: confirm whether `/` is actually gated or open when
  signed out).
- `/complete-registration` — onboarding form, gated to authenticated-but-not-yet-registered users only (`src/proxy.ts`).
- `/privacy-policy`, `/terms-and-conditions` — always public, short-circuited before any auth check in `src/proxy.ts`.

## 4. Shared components (`src/components`)

- `components/app/app-modal.tsx` — generic modal shell (title/icon/body/footer), used by every feature dialog.
- `components/app/confirm-dialog.tsx` + `save-confirm-dialog.tsx` + `use-submit-confirm.ts` — the shared two-step "review before save" pattern (see `docs/improve-architecture/CODEBASE.md` §9). Reused by every create/edit dialog across features.
- `components/app/toast.tsx` — renders `src/stores/toast-store.ts`'s queue.
- `components/layout/app-shell.tsx`, `app-sidebar.tsx`, `app-header.tsx`, `ocean-backdrop.tsx`, `auth-shell.tsx` — chrome, not business logic.
- `components/ui/*` — shadcn/ui primitives (`button`, `dialog`, `dropdown-menu`, `input`, `label`, `table`). Notably **small** for a project with this many data-table modules — see the "TanStack Table not adopted yet" gap below.

## 5. Domain modules (`src/features/*`)

Each feature module follows the canonical shape documented in
`docs/ARCHITECTURE.md` and reverse-engineered in
`docs/improve-architecture/CODEBASE.md` (the "customers" blueprint — read
that file before scaffolding a new feature; not duplicated here).

| Feature | Has `services/` | Has `tests/` | Notes |
|---|---|---|---|
| `customers` | yes | yes | Reference blueprint module |
| `products` | yes | yes | |
| `expenses` | yes | yes | |
| `deliveries` | yes | yes | Most complex recurrence logic (ADR 0002) |
| `maintenance` | yes | **no** | No dedicated `tests/` folder found — **Confirmed gap**, flag if adding maintenance tests |
| `documents` | yes | **no** | No dedicated `tests/` folder found |
| `notifications` | yes | **no** | Realtime subscription + bell UI; no `tests/` folder found |
| `aquaflow-ai` | yes | yes | Owner-only; mock LLM backend today |
| `registration` | yes | tests colocated at feature root (not in `tests/`) | Deviates from `docs/TESTING.md`'s "tests must live in `tests/`" rule — **Potentially outdated / drift**: `registration.guards.test.ts` etc. sit beside their source files, not in `src/features/registration/tests/` |
| `landing` | no | no | Presentational marketing sections only, no data layer |
| `legal` | no | no | Renders static content from `src/content/legal` |
| `playground` | yes (thin) | no | Scratch/demo module — **Requires validation** |

Public API rule (**Confirmed**, `docs/improve-architecture/CODEBASE.md` §2):
other layers must import only from a feature's `index.ts` barrel, never reach
into `services/` or `hooks/` directly.

## 6. Service layer / data-access layer

Location: `src/features/<feature>/services/<feature>.service.ts`.
**Confirmed** pattern (from `customers.service.ts`, read in full):

- Every exported function takes an already-authenticated `SupabaseClient` as
  its first argument — it never creates its own client.
- One Supabase call per function; on `{ error }`, throws a generic
  user-safe `Error` from `<feature>.constants.ts` (raw Postgres error text
  never reaches the UI).
- On success, response is parsed through a Zod row schema, then mapped to the
  display model via `<feature>.mapper.ts`.
- `.is('deleted_at', null)` filters are explicitly documented as **UX/idempotency**
  filters, not the tenant-isolation boundary — RLS is the real boundary
  (see `07-data-architecture.md` for the RLS model in full, referenced not
  duplicated here).
- **Known gap** (**Confirmed**, still true as of this pass —
  `getActiveCustomers` takes no filter/pagination args): list reads fetch
  *all* non-deleted rows and the page component does search/filter/pagination
  client-side in a `useMemo`. Documented in
  `docs/improve-architecture/architecture-review.html` as the top production-readiness
  blocker. Check whether this has been fixed in a given feature before
  copying the pattern into a new module.

## 7. Server-side code / API endpoints (`src/app/api/*`)

Only one Route Handler exists: `src/app/api/aquaflow-ai-mock/route.ts` (POST).
It is an explicitly-labeled **mock** of a future Supabase Edge Function /
Gemini-backed AI reply endpoint (comment: "Returns canned, business-shaped
replies in the same contract a real Gemini-backed Supabase Edge Function will
use"). It has a colocated test: `route.test.ts`. **Confirmed.**

`docs/ARCHITECTURE.md` explicitly forbids creating `*.api.ts` files or raw
`fetch('/api/...')` helpers for **normal Supabase database queries** — Route
Handlers are reserved for cases the Supabase SDK can't do directly (like this
AI mock, or future server-only integrations).

There are two Supabase **edge functions** referenced but living outside this
repo (`create-aquaflow-organization`, `aquaflow-add-staff`,
`update-clerk-session-tokens`) — see `docs/adr/0001-...md` and
`docs/adr/0009-...md`. Their URLs are consumed via env vars in
`src/features/registration/registration.constants.ts`
(`NEXT_PUBLIC_SUPABASE_EDGE_CREATE_ORG_URL`,
`NEXT_PUBLIC_SUPABASE_EDGE_ADD_STAFF_URL`). **Inferred**: these functions'
source is not in this repo (no `supabase/functions/` folder found).

## 8. Hooks

- `src/hooks/use-clerk-supabase.ts` — the **only** cross-feature shared hook.
  Memoizes a Supabase browser client bound to the current Clerk session token
  (`getToken({ template: 'water-station' })`). Every feature query/mutation
  hook calls this to get its client.
- Feature-local hooks live in `src/features/<feature>/hooks/`: one `use-<feature>.ts`
  (read/`useQuery`), one `use-create/update/archive-<feature>.ts` per mutation,
  one `use-<feature>-owner.ts` resolving `{ orgId, createdBy }` from Clerk
  claims for create flows, and (in `customers`) a generic
  `use-mutation-dialog.ts` dialog/mutation glue adapter.

## 9. State management (`src/stores`)

**Important discrepancy — Confirmed, Potentially outdated docs**: `CLAUDE.md`,
`docs/ARCHITECTURE.md`, and `docs/CODING_STANDARDS.md` all instruct agents to
"use Zustand for lightweight client/UI state." **`zustand` is not a dependency**
in `package.json` (checked — absent from both `dependencies` and
`devDependencies`). What actually exists in `src/stores/*` is a hand-rolled
module-level pub/sub pattern built on `useSyncExternalStore`:

- `sidebar-store.ts` / `use-sidebar.ts` — sidebar collapsed state.
- `theme-store.ts` / `use-theme.ts` — dark/light theme, persisted to
  `localStorage`.
- `toast-store.ts` — toast queue, consumed by `components/app/toast.tsx`.

Each store file has an explicit code comment: `// Module-level ... state — no
external dep needed`. This is a deliberate, working substitute for Zustand,
not a bug — but any agent asked to "add a Zustand store" should either (a)
follow this existing pub/sub pattern for consistency, or (b) flag the
docs/code mismatch to the user rather than introducing the zustand package
unilaterally (per `docs/AI-GUARDRAILS.md`: "Add new dependencies without
justification" is disallowed). **Requires validation**: confirm with the user
before adding the zustand package to `package.json`.

Nothing feature-specific belongs in `src/stores` — server state is TanStack
Query, dialog/form state is local `useState`/RHF (see
`docs/improve-architecture/CODEBASE.md` §10 for the full state-ownership table).

## 10. Utility modules (`src/lib`)

- `src/lib/supabase/client.ts` — `createClerkSupabaseClient(getToken)`: the
  one and only place a Supabase browser client is constructed, using
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and the
  `accessToken` option to forward the Clerk JWT. Has a colocated test
  (`client.test.ts`).
- `src/lib/utils.ts` — `cn()` helper for conditional Tailwind classes (shadcn
  convention, aliased as `@/lib/utils` in `components.json`).

## 11. Type definitions (`src/types`)

`src/types/globals.d.ts` — the single global ambient declaration file:
`CustomJwtSessionClaims` (Clerk ↔ Supabase claim shape: `organization`
uuid, `is_owner`, `name`, `email`, `organization_name`, `organization_role`).
Everything else is feature-scoped (`<feature>.types.ts` inside each feature
folder), not global — **Confirmed**, no other `.d.ts`/global type file found.

## 12. Validation schemas

Zod schemas live per-feature in `<feature>.schema.ts`, never centralized.
Two schemas per entity by convention: a row schema (validates Supabase
responses) and a form schema (drives RHF + is the type source via `z.infer`/
`z.input`/`z.output`). See `docs/improve-architecture/CODEBASE.md` §3–4 for
the full four-shape type model (`Row` / `Display` / `FormValues` /
`Insert`/`Update`) — not duplicated here.

## 13. Middleware

`src/proxy.ts` is the Clerk auth middleware (`clerkMiddleware(...)` +
`export const config = { matcher: [...] }`). **Unusual naming**: Next.js
conventionally expects this file named `middleware.ts` at the project or
`src/` root, and no `middleware.ts` file exists in the repo (**Confirmed** via
glob). **Update — Confirmed active via runtime evidence**: a captured
dev-server log left in the repo, `docs/specs/010-rebuild-ui-ux-deliveries-module/next-dev.log`,
shows Next's own per-request timing breakdown naming `proxy.ts` as a
first-class phase on every request (e.g. `GET /dashboard 200 in 317ms
(next.js: 151ms, proxy.ts: 55ms, application-code: 111ms)`), alongside the
file's own `[Middleware Log]` console output. This confirms Next.js 16.2.7
(this repo's pinned version) natively recognizes `proxy.ts` as the
middleware/edge-proxy convention and executes it on every request — it is
**not** dead code. See [`03-specification-status.md`](03-specification-status.md)
row 1 for the full evidence trail.

Logic performed: legal routes pass through unconditionally → unauthenticated
users redirected to `/sign-in` (except public routes) → authenticated-but-unregistered
users forced to `/complete-registration` → registered users on
public/registration routes redirected to `/dashboard`. See
`docs/adr/0001-onboarding-gating-via-clerk-claims.md`.

## 14. Background jobs

**None found.** No queue, cron, or scheduled-job infrastructure in the repo.
Deliveries/maintenance "recurrence" is **client-triggered rolling
materialization** (a service call that runs when a user loads the relevant
page, not a server-side cron) — see `docs/adr/0002-deliveries-two-entity-rolling-materialization.md`
and `docs/adr/0006-maintenance-roll-forward-occurrences.md`. Realtime
notifications (§ below) are the closest thing to "background" behavior, and
those are Postgres-trigger-authored, not app-scheduled.

## 15. Scripts

`package.json` defines exactly four npm scripts: `dev` (`next dev`), `build`
(`next build`), `start` (`next start`), `lint` (`eslint`), `test`
(`vitest run`). No custom Node scripts, seed scripts, or CLI tooling found
under a `scripts/` folder (**Confirmed**, no such folder exists at repo root).

## 16. Tests

Vitest, configured in `vitest.config.ts` (`environment: 'node'`, includes
`src/**/*.{test,spec}.{ts,tsx}`, `@` alias to `src/`). Per
`docs/TESTING.md`, feature tests must live in
`src/features/<feature>/tests/` — **mostly followed** (customers, products,
expenses, deliveries, aquaflow-ai all have a `tests/` folder), with two
documented exceptions: `registration` (tests colocated beside source files)
and `maintenance`/`documents`/`notifications` (no `tests/` folder at all
today). One test lives outside any feature folder:
`src/app/api/aquaflow-ai-mock/route.test.ts` (route handler test, arguably
correct since it's not a feature). `src/lib/supabase/client.test.ts` also sits
outside a feature — acceptable since it's shared infra, not feature logic.

## 17. Database files

No `supabase/migrations/` folder in this repo (see §1). The authoritative
records are:
- `docs/DATABASE.md` — table/RLS documentation, kept in sync per
  `docs/SECURITY.md`'s requirement ("Every policy must be documented in
  `docs/DATABASE.md`").
- Per-feature SQL/migration-shaped markdown under `docs/specs/*/` (e.g.
  `docs/specs/004-deliveries-module/004-deliveries-schema.md`,
  `docs/specs/008-build-maintenance-module/maintenance_migration.md`,
  `docs/specs/007-remap-ui-products-customers/007-status-columns.sql`,
  `docs/specs/013-realtime-notifications-features/013-notifications.sql`).

See `07-data-architecture.md` for the full schema/RLS breakdown (referenced,
not duplicated here).

## 18. Infra / deployment / config files

| File | Purpose |
|---|---|
| `next.config.ts` | Minimal — only sets `turbopack.root`. No custom headers, redirects, rewrites, or image domains configured (**Confirmed** by full read). |
| `tsconfig.json` | Strict mode on, `@/*` → `src/*` path alias, bundler module resolution, Next.js TS plugin. |
| `eslint.config.mjs` | Flat config, extends `eslint-config-next` core-web-vitals + typescript configs. No custom rules added. |
| `components.json` | shadcn/ui config — style `radix-vega`, neutral base color, CSS variables on, icon library `lucide`. |
| `vitest.config.ts` | Node test environment, `@` alias mirrors tsconfig. |
| `.env` | Present at repo root, **git-ignored** (`.gitignore` line `.env*`). Do not read or print its contents — treat as secret. Allowed public env var names per `docs/SECURITY.md`/`CLAUDE.md`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, plus the two edge-function URL vars in §7. |
| `.gitignore` | Ignores `.next/`, `.vercel`, `*.tsbuildinfo`, `next-env.d.ts`, `.env*`. The `.vercel` entry is the only signal of a deployment target — **Inferred**, not explicitly configured (no `vercel.json`, no `.github/workflows/*` found). |

No Dockerfile, no CI workflow files, no IaC found. Deployment pipeline itself
is **Unknown** — likely a Vercel git-integration deploy given the Next.js
default + `.gitignore` hint, but not confirmed anywhere in-repo.

## 19. Generated files — never edit

- `.next/` — Next.js build output.
- `node_modules/`
- `*.tsbuildinfo` (e.g. `tsconfig.tsbuildinfo`) — TypeScript incremental build cache.
- `next-env.d.ts` — Next.js-generated ambient types, regenerated automatically.
- `.vercel/` (if present locally) — Vercel CLI project link, not committed.

## 20. Where to make changes

| Change needed | Start here | Supporting files | Warnings |
|---|---|---|---|
| Add a new page/route | `src/app/(protected)/<route>/page.tsx` (thin wrapper, `export const dynamic = 'force-dynamic'`) | The feature's `components/<feature>-page.tsx`; add nav entry in `src/components/layout/app-sidebar.tsx` if it needs sidebar visibility | Do not put business logic in `page.tsx` (`docs/ARCHITECTURE.md`). If owner-only, follow the 3-layer pattern in `docs/adr/0008-owner-only-route-level-gating.md` (nav hide + route guard + RLS), not nav-hide alone. |
| Add a new domain feature module | `docs/specs/[nnn-feature-name]/` spec folder first (per `CLAUDE.md`'s spec-driven workflow) | Copy the shape from `docs/improve-architecture/CODEBASE.md` (customers blueprint): `types`/`schema`/`constants`/`mapper`/`guards`/`keys`/`services/`/`hooks/`/`components/`/`tests/`/`index.ts` | Do not invent structure — follow the checklist in that doc's §14 exactly. Must add `org_id`/`created_by` resolution via a `use-<feature>-owner.ts` hook, never from form input. |
| Add a Supabase read/write operation | `src/features/<feature>/services/<feature>.service.ts` | `<feature>.schema.ts` (row validation), `<feature>.mapper.ts`, `<feature>.constants.ts` (table name/columns/error strings) | Never raw `fetch`; always take `client: SupabaseClient` as first param; always throw a generic constant-string error, never the raw Postgres error. |
| Change authentication/session logic | `src/proxy.ts` (middleware) + `src/features/registration/registration.guards.ts` (`isRegistered()`) | `src/types/globals.d.ts` (claim shape), `docs/adr/0001-onboarding-gating-via-clerk-claims.md` | High-risk area — `docs/AI-GUARDRAILS.md` says "do not change authentication or authorization logic casually." First verify whether `src/proxy.ts` is even active as middleware (see §13 warning) before assuming changes take effect. |
| Add/change a database field | `docs/DATABASE.md` (document first) + the relevant `docs/specs/*` SQL/migration doc | `<feature>.types.ts`, `<feature>.schema.ts`, `<feature>.mapper.ts`, `<feature>.constants.ts` (column list) | No `supabase/` folder — migrations are run manually in the Supabase dashboard per the referenced spec doc. Never weaken RLS. Update `docs/DATABASE.md` policies table in the same change. |
| Add a new user role or change role rules | `src/types/globals.d.ts` (`is_owner`/`organization_role` claims) | `<feature>.guards.ts` per feature, `src/components/layout/app-sidebar.tsx` (`ownerOnly` nav flag), RLS policies in `docs/DATABASE.md` | Only Owner/Staff exist today (`CLAUDE.md`). RLS is the real boundary — a new role needs a 3-layer change (guard predicate + UI gate + RLS), not UI-only. |
| Change/add form validation | `<feature>.schema.ts` (`<feature>FormSchema`) | Types are inferred via `z.infer`/`z.input`/`z.output` — do not hand-write parallel types | Row schema and form schema for one entity live in the same file "so they can't drift" — keep that convention. |
| Add a notification | `src/features/notifications/*` (existing realtime feature) | `docs/DATABASE.md` §`public.notifications`, `docs/adr/0010-notifications-trigger-authored-consume-only.md` | Notifications are written **only** by `SECURITY DEFINER` Postgres triggers — there is deliberately no client/service INSERT path. Do not add a client-side insert. |
| Add analytics/telemetry | None exists today (**Confirmed** — no posthog/sentry/analytics/logger dependency or usage found in `src/`) | — | This would be a new dependency; per `docs/AI-GUARDRAILS.md` get explicit approval before adding one. |
| Change deployment config | `next.config.ts` | `.gitignore` `.vercel` hint | No deployment config exists to "change" today — this is greenfield. Confirm the actual hosting target with the user before assuming Vercel specifics. |
| Add/modify a data table UI | New module: build on `@tanstack/react-table` per `docs/CODING_STANDARDS.md` | `src/components/ui/table.tsx` (shadcn primitive) | **Drift warning**: the existing `customers`/`products`/etc. list UIs use hand-rolled inline-styled grids, not TanStack Table, despite it being an installed dependency and a documented hard rule ("use TanStack Table for every module's data table, not just complex ones"). Confirm with the user whether to follow the documented rule (new code) or match existing sibling modules before choosing — see `docs/improve-architecture/architecture-review.html` Candidate 4. |
| Add global client/UI state | `src/stores/` | See §9 — follow the existing hand-rolled `useSyncExternalStore` pub/sub pattern used by `sidebar-store.ts`/`theme-store.ts`/`toast-store.ts` | Do not add the `zustand` package unilaterally even though docs mention it — it is not an existing dependency; flag the mismatch instead (see §9). |

## Unresolved questions surfaced while mapping (for aggregation, not answered here)

- Is `src/proxy.ts` actually wired as Next.js middleware given the non-standard filename, or does it silently no-op?
- Is `/` (landing page) intended to be public when signed out, given it's commented out of `isPublicRoute` in `src/proxy.ts`?
- Is `/sales` and `/playground` intentionally unbuilt/scratch, or missing work?
- Should `zustand` be added as a real dependency, or should `CLAUDE.md`/`docs/ARCHITECTURE.md` be amended to describe the hand-rolled store pattern actually in use?
- Should the TanStack-Table rule be enforced going forward, or should the docs be amended to match the hand-rolled grid pattern already shipped in `customers`/`products`/etc.?
