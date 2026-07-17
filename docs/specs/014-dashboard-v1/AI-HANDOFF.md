# AI Handoff — Dashboard V1

## Outcome

Dashboard V1 is implemented at `/dashboard`. The protected route now renders a
role-aware, Supabase-backed water-station operations cockpit instead of the
landing-page preview.

Owners receive completed-delivery financial analytics plus operations. Staff
receive operations only and never enable the financial RPC. The four supported
periods are `today`, `yesterday`, `this_week`, and `this_month`; the page creates
one ISO reference date and uses it for both query families.

The user confirmed migration application on 2026-07-17. From the canonical
`water-station-supabase` repository, linked migration history is synchronized
through `20260717100000`, the linked dry run is empty, and database lint is
clean. The AI agent did not execute a non-dry-run database push.

## Read first

1. `docs/specs/014-dashboard-v1/AI-HANDOFF.md` (this file)
2. `docs/specs/014-dashboard-v1/MIGRATION.md`
3. `docs/specs/014-dashboard-v1/ACCEPTANCE.md`
4. `docs/specs/014-dashboard-v1/technical-plan.md`
5. `docs/adr/0016-dashboard-role-partitioned-aggregates.md`
6. `docs/DESIGN.md`

Use `ai-agent-guide.md` for locked metric behavior. Treat
`AquaFlow Dashboard.html` as composition inspiration only.

## Implementation entry points

- Route: `src/app/(protected)/dashboard/page.tsx`
- Page composition: `src/features/dashboard/components/dashboard-page.tsx`
- Financial/operational contracts: `src/features/dashboard/dashboard.types.ts`
- Strict RPC validation: `src/features/dashboard/dashboard.schema.ts`
- Explicit mapping: `src/features/dashboard/dashboard.mapper.ts`
- Period/date logic: `src/features/dashboard/dashboard.dates.ts`
- Query keys and hooks: `src/features/dashboard/dashboard.keys.ts` and
  `src/features/dashboard/hooks/use-dashboard.ts`
- RPC service: `src/features/dashboard/services/dashboard.service.ts`
- Owner analytics: `src/features/dashboard/components/dashboard-financials.tsx`
- Shared operations: `src/features/dashboard/components/dashboard-operations.tsx`
- Focused tests: `src/features/dashboard/tests/`
- Public feature API: `src/features/dashboard/index.ts` exports only
  `DashboardPage` and `dashboardKeys`.

The client calls only `get_dashboard_financials(text,date)` and
`get_dashboard_operations(text,date)`. It never sends an organization ID or
role, and it never downloads source rows for client-side aggregation.

## Behavior implemented

- Compact greeting/header, completed-delivery revenue disclosure, and four-way
  period selector.
- Owner Delivery-sales KPI plus shared completed-delivery/refill KPIs; pending
  deliveries appears only for Today.
- Owner-only sales-versus-expenses, sales mix, and deterministic top-five
  products.
- Shared today's queue, low-stock alerts, and maintenance-due panels.
- Independent financial/operational skeleton, refresh, error/retry, retained
  previous-data, true-empty, period-empty, and panel-empty states.
- Strict malformed-payload failure with user-safe messages.
- Accessible SVG/CSS charts with legends, values, descriptions, and no chart
  dependency.
- Tailwind-only dashboard styling using the existing app shell and `--app-*`
  tokens. Added shadcn source components: `skeleton`, `toggle`, and
  `toggle-group`.

## Delivery snapshot integration

Delivery forms, mappers, services, and materialization now carry
`is_stock_tracked` explicitly from the selected product or schedule snapshot.
The migration triggers remain the authoritative integrity boundary for every
write path, including the unchanged
`replace_delivery_items_atomic(integer,date,text,jsonb)` browser interface.

Historical backfill remains best-effort: a product reclassified before the
migration cannot have its former classification reconstructed. Dashboard V1
also treats every non-stock-tracked completed item quantity as a refill unit;
this can include non-refill services.

## Cache invalidation

- Delivery create/edit/status/schedule changes invalidate financial and
  operational Dashboard families.
- Expense create/update/archive invalidates financials only.
- Product create/update/status/archive invalidates operations only.
- Maintenance schedule/task create/update/status/complete/cancel/archive
  invalidates operations only.

No mutation clears the entire TanStack Query cache.

## Verification evidence

Database, from `water-station-supabase`:

- `npx supabase migration list --linked` — local and remote match through
  `20260717100000`.
- `npx supabase db push --linked --dry-run` — remote database is up to date.
- `npx supabase db lint --linked --level warning` — no schema errors or warnings.

Application, from `water-station-web`:

- `npm run typecheck` — pass.
- `npm run test` — pass, 63 files / 278 tests.
- `npm run lint` — pass with 0 errors and 12 pre-existing warnings outside the
  Dashboard feature.
- `npm run build` — pass; `/dashboard` builds as a dynamic protected route.
- Focused Dashboard + delivery run — 22 files / 90 tests pass.
- `git diff --check` — no whitespace errors; PowerShell reports only the
  repository's existing LF-to-CRLF notices.

Automated coverage includes period/leap/short-month boundaries, trend zero
baselines, decimal payloads, strict schemas/mappers, service parameters/errors,
owner query enablement, query families, Today-only pending rendering, zero sales
mix, panel empty states, and accessible chart descriptions.

## Remaining production sign-off

The in-app browser runtime was unavailable during this session. Do not mark the
remaining acceptance items complete until these are captured:

1. With real Clerk-backed Supabase clients, verify owner success for both RPCs,
   staff financial rejection (`42501`), staff operations success, active-org
   switching for a multi-membership user, and no cross-tenant values.
2. Run the SQL metadata/policy/trigger/index checks in `MIGRATION.md`; confirm
   `SECURITY INVOKER`, authenticated-only grants, source RLS, and the single
   documented users SELECT policy delta.
3. Capture representative `EXPLAIN (ANALYZE, BUFFERS)` results for completed
   delivery and expense period paths.
4. Perform signed-in mobile/tablet/desktop, expanded/collapsed sidebar,
   light/dark, keyboard/focus, reduced-motion, and populated/empty/error UI QA.
5. When those checks pass, set ADR 0016 to `Accepted` and complete the unchecked
   items in `ACCEPTANCE.md`.

## Deferred scope

POS and walk-in sales remain out of Dashboard V1. Revenue is completed-delivery
snapshot quantity × snapshot unit price, bounded by `completed_at`.

## Feature 015 presentation follow-up

`docs/specs/015-dashboard-improvements-and-bugs/` refines the Dashboard V1
presentation without changing its RPCs or security boundary:

- Delivery Sales remains featured; the other KPIs use the Customers-style glow
  and water wave.
- KPI comparisons render only for Today versus Yesterday or Yesterday versus
  Today. Pending Deliveries never shows a comparison.
- Sales versus Expenses has an independent Weekly/Monthly query and control;
  Monthly displays one aggregated month-to-date sales/expense pair.
- Low Stock and Maintenance Due use title-case headers and top-right buttons.

The Yesterday UI obtains the Today comparison through the existing bounded RPC
and TanStack Query cache. Staff still never enable a financial query.

## Working-tree caution

The repository contains unrelated user edits in customers, documents,
maintenance, products, project context, and other feature specs. Preserve them.
Use `git diff` by path before attributing or modifying any overlapping file.
