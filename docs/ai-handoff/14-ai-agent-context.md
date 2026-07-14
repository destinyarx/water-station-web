# AI Agent Context — Compact Reference

> Load this file first, before scanning source code. It links out to the
> detailed domain documents rather than repeating them.

## Instructions for Future AI Agents

1. Read this file before scanning source code.
2. Open only the linked domain document relevant to the current task.
3. Inspect source files only when the documentation does not answer the question or when implementation verification is required.
4. Treat repository code as the final source of truth when it conflicts with documentation.
5. Update the relevant handoff document after making material architectural or workflow changes.

Analysis date: 2026-07-14. Branch analyzed: `development` (clean at time of analysis). See [`README.md`](README.md) for full navigation and limitations.

## Project summary

**AquaFlow** is a multi-tenant Next.js/Supabase SaaS dashboard for small
**water refilling station** businesses (Philippines context — peso currency,
barangay/municipality/province address fields, RA 10173 privacy references).
It replaces manual/paper tracking of customers, product catalogs, deliveries,
expenses, and equipment maintenance. See [`01-product-overview.md`](01-product-overview.md).

## Main users

Two roles per organization, both scoped to exactly one tenant:

- **Owner** — full org access: all modules, financial summaries, AquaFlow AI, archiving/approval actions, owner-only routes.
- **Staff** — day-to-day operations: assigned deliveries, customers, products (edit only what they created, except products has an owner-override), maintenance tasks. No AquaFlow AI, no financial summaries.

Full role matrix: [`01-product-overview.md`](01-product-overview.md) §User Roles.

## Main workflows

9 real, working workflows plus 1 unbuilt placeholder — see
[`02-user-workflows.md`](02-user-workflows.md) for full detail:

1. Auth/onboarding (Clerk sign-up → org creation or staff-add via Supabase Edge Functions → `/complete-registration` gate)
2. Customer management (CRUD, archive, active/inactive)
3. Product catalog management (CRUD, owner-override editing, active/discontinued)
4. Expense recording (CRUD, category/payment-method breakdown, summary cards)
5. Delivery scheduling & status (recurrence engine — **weekly only, monthly is unimplemented**; stock-at-dispatch; largest, most-evolved module across 3 spec generations)
6. Equipment maintenance scheduling (recurrence + roll-forward on completion)
7. Document metadata tracking (**no real file upload/storage wired — metadata rows only, by design**)
8. Real-time notifications (bell icon; only maintenance-assignment currently triggers one)
9. AquaFlow AI assistant (owner-only; **backed by a keyword-matched mock endpoint, no real LLM**)
10. **Sales** — nav-orphaned stub page, no feature module, no spec. Not implemented.

## Technology stack

Next.js App Router (TypeScript, strict), Clerk (auth/identity), Supabase (Postgres + RLS + Realtime, accessed via `@supabase/supabase-js` SDK directly from the browser), TanStack Query (server state), React Hook Form + Zod (forms/validation), shadcn/ui + Tailwind (UI), Vitest (testing, `node` environment — no component-rendering tests). `@tanstack/react-table` is installed but **not used** (list pages are hand-rolled grids); `zustand` is **not installed** despite being mandated in docs (stores are hand-rolled `useSyncExternalStore` pub/sub). Full detail: [`06-technical-architecture.md`](06-technical-architecture.md), [`05-codebase-map.md`](05-codebase-map.md).

## Architecture summary

Feature-based modules under `src/features/[feature]/` (schema/types/constants/keys/mapper/guards + `components/`, `hooks/`, `services/`), consumed by thin Next.js pages under `src/app/(protected)/*` and `src/app/(auth)/*`. Normal CRUD flows entirely through Supabase SDK feature services — **no custom REST API layer** for normal data access (the one exception is `/api/aquaflow-ai-mock`, a Route Handler for the mock AI). Auth/onboarding gating is enforced by `src/proxy.ts` (Clerk middleware — **non-standard filename, but confirmed active** via runtime log evidence, see [`03-specification-status.md`](03-specification-status.md) row 1). Tenant isolation and record ownership are enforced by Supabase RLS as the real security boundary, not client-side filters. Request lifecycle and Mermaid diagram: [`06-technical-architecture.md`](06-technical-architecture.md).

## Important business rules

- `org_id` and `created_by` must always come from the Clerk session (via `use-*-owner` hooks), never from form input — **confirmed consistently enforced** across every feature.
- Soft delete (`deleted_at`) excludes rows from active lists; hard delete is not the normal UI path.
- Owner-only actions: archiving delivery/maintenance schedules, approving documents, editing any org product (staff can only edit their own), AquaFlow AI access.
- Deliveries and maintenance use a "shared org queue" model — any staff can act on any org record, but only owners can archive schedules.
- See [`01-product-overview.md`](01-product-overview.md) for the full glossary and [`04-feature-map.md`](04-feature-map.md) for per-feature rules.

## Authentication & authorization summary

Clerk issues sessions with custom claims (`organization`, `is_owner`, `name`, `email`) sourced from `public_metadata`. `src/proxy.ts` (Clerk middleware, confirmed active) redirects unauthenticated users to sign-in, unregistered users to `/complete-registration`, and gates every other protected route. No per-page server-side `auth()` check exists beyond middleware (except `/ai-assistant`) — this is a **known defense-in-depth gap**, see [`10-security-and-risks.md`](10-security-and-risks.md). Supabase RLS independently re-enforces org isolation using the same JWT claims. Full detail: [`10-security-and-risks.md`](10-security-and-risks.md), [`08-api-and-integrations.md`](08-api-and-integrations.md).

## Main database entities

Postgres via Supabase, no `supabase/migrations` folder (schema applied manually, documented in `docs/DATABASE.md` + per-spec SQL snapshots). Core tables: `organizations`, `organization_members`, `customers`, `products`, `expenses`, `delivery_schedules`/`deliveries`/`delivery_schedule_items`/`delivery_items`/`delivery_schedule_dates`, `maintenance_schedules`/`maintenance_tasks`, `documents` (undocumented in `docs/DATABASE.md`), `notifications`, `ai_conversations`/`ai_messages`. **Known unresolved risk**: `docs/DATABASE.md` documents `customers`/`products` `org_id` as `integer`, but the Zod schemas and ADR 0009 say `uuid` — live column type unconfirmed, see [`15-open-questions.md`](15-open-questions.md). Full schema detail: [`07-data-architecture.md`](07-data-architecture.md).

## Main routes

`/` (landing, public), `/sign-in`, `/sign-up`, `/complete-registration`, `/dashboard` (**static mock, not wired to real data**), `/customers`, `/products`, `/expenses`, `/deliveries`, `/maintenances`, `/documents`, `/ai-assistant` (owner-only), `/sales` (**empty stub**), `/playground` (internal dev tool, unguarded), `/privacy-policy`, `/terms-and-conditions`. Full route table: [`09-frontend-and-ux.md`](09-frontend-and-ux.md).

## Main feature modules

Customers, Products, Expenses, Deliveries, Maintenance, Documents, Notifications, AquaFlow AI, Registration/Onboarding, Legal. Full inventory and per-feature detail: [`04-feature-map.md`](04-feature-map.md). Spec-to-code traceability: [`03-specification-status.md`](03-specification-status.md).

## Important external integrations

- **Clerk** — auth, sessions, JWT custom claims, legal-consent capture at sign-up.
- **Supabase** — Postgres, RLS, Realtime (notifications), accessed directly from the browser via the SDK; 3 Edge Functions (org creation, add-staff, an internal email test tool) called via `axios`.
- No LLM provider, no payment processor, no analytics/error-monitoring/observability tooling of any kind.

Full detail: [`08-api-and-integrations.md`](08-api-and-integrations.md).

## Important repository paths

- `src/features/[feature]/` — feature modules (business logic lives here)
- `src/app/(protected)/*`, `src/app/(auth)/*` — thin route wrappers
- `src/proxy.ts` — Clerk middleware (confirmed active, non-standard filename)
- `src/lib/`, `src/hooks/`, `src/stores/`, `src/types/` — shared layer
- `docs/specs/[nnn-feature-name]/` — canonical feature specs (spec-driven development)
- `docs/adr/` — architecture decision records
- `docs/DATABASE.md` — primary (but partially stale) schema/RLS reference
- `CLAUDE.md`, `AGENTS.md`, `CONTEXT.md` — required reading before coding, per project rules

Full map: [`05-codebase-map.md`](05-codebase-map.md).

## Known risks (see full detail in linked docs)

1. **`org_id` type contradiction** in `docs/DATABASE.md` (customers/products documented as `integer`, but schemas/ADR 0009 say `uuid`) — the single highest-priority documentation/data-integrity item. [`15-open-questions.md`](15-open-questions.md), [`10-security-and-risks.md`](10-security-and-risks.md).
2. No per-page server-side auth check beyond middleware (defense-in-depth gap).
3. No CI, no error monitoring, no migrations folder — regressions and schema drift are only caught manually.
4. Document uploads are metadata-only (no real file storage) — blocks any mobile camera-capture story.
5. Client-side "fetch all rows" list reads in every module's list service — a scaling gap that compounds as data grows.
6. Deliveries' revert/reopen capability (ADR 0003) appears to have silently regressed — dead UI wiring remains.

Full prioritized list (Q01–Q20): [`11-quality-and-improvements.md`](11-quality-and-improvements.md).

## Current priorities

No product roadmap or priority ranking exists in the repository beyond the specs already implemented. The highest-leverage next steps, in order, per the quality-and-improvements analysis: reconcile the `org_id` documentation contradiction, add a CI workflow, decide the Zustand/TanStack Table documentation-vs-code conflicts one way or the other, and fix server-side filtering/pagination in list services before data volume grows further.

## Mobile-readiness summary

No mobile work exists today (no React Native/Expo/Capacitor project). Recommended path: ship responsive/PWA improvements to the existing web app first (cheap, benefits all roles, forces the mobile-table-layout gap to get fixed), then build a narrowly-scoped React Native/Expo app for Staff field workflows (delivery + maintenance status updates, push notifications, camera for proof-of-work once the document-storage gap is fixed). Business rules, Zod schemas, and Supabase service-layer logic are largely reusable; UI components and the hand-rolled data grids are web-specific. Full reusability table and phased plan: [`13-mobile-handoff.md`](13-mobile-handoff.md).

## Important terminology

See the full glossary in [`01-product-overview.md`](01-product-overview.md). Key terms: **org_id** (tenant scoping key, type contradiction unresolved), **created_by** (Clerk user id, never form-supplied), **stock-tracked vs. non-stock-tracked product**, **shared org queue** (deliveries/maintenance — any staff can act, only owners archive), **owner override** (products only — owners can edit/delete records created by other staff).

## Rules future agents must preserve

- `org_id`/`created_by` always from Clerk session claims, never form input.
- RLS is the real tenant-isolation boundary — never bypass it to "make a query work."
- Soft delete via `deleted_at`; exclude soft-deleted rows from active lists.
- Service-layer error handling: catch `{ error }`, throw a friendly constant string, never surface raw Postgres errors to the UI.
- Follow the existing four-shape type model (Row/Display/FormValues/Insert-Update) with one mapper file per feature.
- Do not add new dependencies (e.g. instrumenting Zustand, adding error-monitoring SDKs) without explicit justification, per `docs/AI-GUARDRAILS.md`.

## Things that remain unknown

Full list: [`15-open-questions.md`](15-open-questions.md). Highest-priority: the live `org_id` column type for `customers`/`products`; whether documented RLS policies match what's actually deployed (no migrations folder to diff against); the real deployment/CI pipeline; whether the Zustand/TanStack Table documentation mismatches are intentional.
