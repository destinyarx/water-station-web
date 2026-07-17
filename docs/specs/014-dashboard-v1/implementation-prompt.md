# Dashboard V1 — Implementation Prompt

Copy everything between **BEGIN PROMPT** and **END PROMPT** into the coding
agent that will plan and implement Dashboard V1.

---

## BEGIN PROMPT

You are implementing Dashboard V1 for AquaFlow, a multi-tenant Water Refilling
Station Management System. Replace the protected `/dashboard` route's static
landing-page preview with a real, role-aware, Supabase-backed dashboard.

This is a spec-driven task. Do not jump directly into code, do not treat it as a
generic CRUD dashboard, and do not invent a Sales/POS module.

### 1. Read and inspect before changing anything

Read these files completely, in this order:

1. `AGENTS.md`
2. `docs/CONSTITUTION.md`
3. `docs/ARCHITECTURE.md`
4. `docs/CODING_STANDARDS.md`
5. `docs/SECURITY.md`
6. `docs/AI-GUARDRAILS.md`
7. `CONTEXT.md`
8. `docs/DATABASE.md`
9. `docs/DESIGN.md`
10. `docs/TESTING.md`
11. `docs/specs/014-dashboard-v1/ai-agent-guide.md`
12. `docs/tasks/0-editor.md`
13. `docs/specs/014-dashboard-v1/AquaFlow Dashboard.html`
14. Relevant delivery, product, expense, and maintenance specs/ADRs.

Then inspect, at minimum:

- The protected dashboard route and landing `DashboardPreview` it currently
  reuses.
- Existing feature structure, query keys, hooks, services, schemas, tests, role
  guards, Supabase client helpers, and mutation invalidation patterns.
- Delivery schemas/materialization/status functions and item snapshots.
- Expense aggregate/service behavior.
- Product low-stock rules and maintenance due-date behavior.
- The live Supabase schema, RLS policies, functions, grants, and indexes before
  proposing SQL. Repository documentation may drift from the live database.

Use `docs/DESIGN.md` as the UI authority. Use `AquaFlow Dashboard.html` only as
inspiration for dashboard-body composition and information hierarchy. Do not
copy its hard-coded data, inline CSS, local token names, sidebar, header, or
desktop-only layout.

### 2. Complete the specification first

Before implementation, create or complete the required spec-driven artifacts in
`docs/specs/014-dashboard-v1/`:

```txt
prd.md
REQUIREMENTS.md
ACCEPTANCE.md
research.md
technical-plan.md
issues/
  001-dashboard-foundation.md
  ...small ordered implementation slices...
```

Write testable EARS-style requirements. Keep the PRD implementation-neutral,
put technical decisions in the plan/research, and make acceptance criteria
observable. Record live-schema findings and any documentation drift. Do not
create fake features outside Dashboard V1.

### 3. Current-state and scope constraints

- `/dashboard` currently renders the landing page's static marketing preview.
- `/sales` is only a stub; there is no Sales feature or sales table.
- Dashboard V1 revenue comes only from completed delivery item snapshots:
  `quantity * unit_price`.
- Call this value **Delivery sales**, or otherwise disclose that it excludes
  walk-in/POS sales.
- POS/walk-in sales, orders, payments, invoices, forecasting, exports, custom
  ranges, and customizable widgets are out of scope.
- Do not introduce a chart library, state library, date library, or other major
  dependency without explicit approval.

### 4. Roles and data security

Build a role-aware dashboard.

**Owners see:**

- Delivery sales and trends.
- Sales versus expenses.
- Sales mix.
- Top five products.
- Pending/completed deliveries and refill units.
- Today's delivery queue, low stock, and maintenance due.

**Staff see:**

- Pending deliveries when Today is selected.
- Completed deliveries and refill units.
- Today's delivery queue, low stock, and maintenance due.

Staff must not receive financial values in a database response and then merely
have them hidden in the UI. Enforce owner-only financial access in the database
function using the existing verified owner helper/claim contract. Use UI guards
only as defense in depth and for UX.

All data is organization-owned. Never accept `org_id`, `created_by`, user ID, or
role as dashboard parameters. Clerk/Supabase JWT identity and RLS provide tenant
scope. Never use a service-role key or weaken RLS. Exclude soft-deleted records
from active dashboard calculations.

### 5. Period behavior

Use this shared contract:

```ts
export type DashboardPeriod =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
```

Default to `today`. Display Today, Yesterday, This week, and This month.

Use the project's existing `YYYY-MM-DD` date-key convention and pass one
deterministic `referenceDate` to services/RPCs. Use half-open ranges.

| Period | Start | End exclusive |
| --- | --- | --- |
| Today | Reference date | Reference date + 1 day |
| Yesterday | Reference date - 1 day | Reference date |
| This week | Monday of the reference week | Reference date + 1 day |
| This month | First day of the calendar month | Reference date + 1 day |

This month is calendar-month-to-date, never the last 30 days. Weeks begin on
Monday.

Comparisons:

- Today: yesterday, same weekday one week earlier, and same calendar day one
  month earlier. Clamp a missing prior-month day to that month's final day.
- Yesterday: the immediately preceding day.
- This week: the matching elapsed Monday-through-weekday span in the previous
  week.
- This month: the matching ordinal month-to-date span in the previous calendar
  month, clamped where necessary.

For non-zero baselines, percentage change is
`((current - baseline) / abs(baseline)) * 100`. Preserve raw values and round
only for display. If both values are zero, show **No change**. If the baseline is
zero and current is positive, show **New activity** without an infinite
percentage. If comparison data is missing, show **No comparison data**.

Pending deliveries are a live queue. Do not fabricate historical pending trends
from rows whose statuses have since changed.

### 6. Metrics and aggregation rules

For delivery analytics, use active deliveries whose current status is
`completed`, bounded by `completed_at`, not `delivery_date`.

**KPI cards**

- **Delivery sales**: sum completed delivery lines' `quantity * unit_price` for
  the selected period; owner only.
- **Pending deliveries**: count active `pending` deliveries scheduled on
  `referenceDate`; show this card only for Today.
- **Completed deliveries**: count completed deliveries whose `completed_at` is
  in the selected range.
- **Refill units**: sum completed delivery-item quantity where the snapshotted
  `is_stock_tracked` is false.

Format money in Philippine Peso. Preserve decimal quantities.

For V1, non-stock-tracked delivery quantities are treated as refill units, as
requested. The product model also permits non-stock-tracked fees/services, so
label the card **Refill units**, not gallons, and document this limitation. Do
not use product-name heuristics.

**Sales versus expenses**

- Sales use completed-delivery line totals.
- Expenses use active `expenses.amount` bounded by `date_incurred`.
- Today/Yesterday return one paired daily bucket because expenses have no time.
- This Week returns elapsed daily buckets from Monday.
- This Month returns elapsed calendar-day buckets.
- Return zero buckets for dates without activity.

**Sales mix**

- Refill services: completed-line revenue with snapshotted
  `is_stock_tracked = false`.
- Stock-tracked products: completed-line revenue with snapshotted
  `is_stock_tracked = true`.
- Return revenue and percentage. When total revenue is zero, return zero
  percentages and render an empty state rather than a 50/50 chart.

**Top five products**

- Include both product classes.
- Group by `product_id`; use the most recent snapshot name in the period.
- Rank by units descending, revenue descending, then display name ascending.
- Return at most five rows, including units, revenue, rank, and relative bar
  percentage. Return an empty list when no completed lines exist.

**Operational panels**

- Today's delivery queue: active deliveries scheduled for `referenceDate`, with
  recipient, item summary, assignee if available, and status. Unfinished work
  comes first. Limit the preview and link to `/deliveries`.
- Low stock: active stock-tracked products with stock `<= 10`, including zero.
  Reuse `LOW_STOCK_THRESHOLD`; zero first, then ascending stock/name. Link to
  `/products`.
- Maintenance due: active, non-cancelled, non-deleted pending tasks that are
  overdue or due within seven days. Overdue first, then due date. Link to
  `/maintenances`.

### 7. Required snapshot migration and handoff

`delivery_items` currently snapshots product name, price, and quantity, but not
`is_stock_tracked`. Do not derive durable historical mix/refill analytics by
joining to a product's current classification; products can change or be
archived.

Prepare reviewed migrations in the canonical `water-station-supabase`
repository that:

1. Abort on orphaned delivery/template rows, repair both child `schedule_id`
   foreign keys to `delivery_schedules(id)`, and align only the users SELECT
   policy with the top-level Clerk organization claim.
2. Snapshot `is_stock_tracked` on both `delivery_schedule_items` and
   `delivery_items`.
3. Backfill existing rows from products where reliable.
4. Update every delivery materialization and item-replacement path, including
   atomic functions, to preserve the snapshot.
5. Preserve RLS, grants, corrected constraints, and delivery lifecycle behavior.
6. Add the two dashboard aggregate functions with explicit active-organization
   predicates, role-appropriate activity flags, and only evidence-backed
   indexes.
7. Update `docs/DATABASE.md` and relevant delivery documentation.

Follow the project's migration convention. Present the SQL and exact manual
Supabase steps to the user. Do not run dependent application tests or continue
as though the live migration exists until the user confirms it was applied and
you verify the live schema. If the live database differs from repository docs,
stop and reconcile the plan rather than guessing.

### 8. Query architecture and contracts

Perform aggregation in PostgreSQL, not by downloading raw tables into React.
Use two bounded functions:

```txt
get_dashboard_financials(p_period text, p_reference_date date) -> jsonb
get_dashboard_operations(p_period text, p_reference_date date) -> jsonb
```

Both must be stable/read-only, `SECURITY INVOKER`, executable only by
`authenticated`, RLS-scoped, explicitly restricted to the validated active
organization claim, and strict about allowed periods. The financial function
rejects non-owners. The operational function must contain no sales, expense,
sales-mix, or product-revenue fields.

Create a focused feature under `src/features/dashboard` following the project's
existing architecture. Keep `src/app/(protected)/dashboard/page.tsx` thin.
Use strict TypeScript, explicit exported return types, kebab-case files, single
quotes in TypeScript, and no `any`, `@ts-ignore`, unsafe non-null assertions, or
unnecessary type assertions.

Use Zod to validate unknown RPC payloads before mapping snake_case database data
to explicit camelCase feature contracts. At minimum, model:

- `DashboardPeriod` and comparison keys.
- Metric values and zero-safe trends.
- Sales/expense chart buckets.
- Sales-mix entries.
- Ranked product entries.
- Separate `DashboardFinancials` and `DashboardOperations` results.
- Explicit delivery-queue, low-stock, and maintenance-due item types.

Use TanStack Query with period/reference date in every key:

```ts
export const dashboardKeys = {
  all: ['dashboard'] as const,
  financials: (period: DashboardPeriod, referenceDate: string) =>
    [...dashboardKeys.all, 'financials', period, referenceDate] as const,
  operations: (period: DashboardPeriod, referenceDate: string) =>
    [...dashboardKeys.all, 'operations', period, referenceDate] as const,
}
```

Owners fetch financial and operational queries in parallel. Staff fetch only
operations. Use a 60-second `staleTime`, keep previous period data during a
background refresh when consistent with the installed TanStack Query version,
and do not add polling by default.

Add targeted dashboard invalidation after relevant:

- Delivery create, edit, status completion/revert, failure, or cancellation.
- Expense create, update, or archive.
- Product stock, status, or classification changes.
- Maintenance completion/cancellation when attention panels change.

Do not clear the whole query cache.

### 9. UI implementation

Translate the reference hierarchy into the existing protected app shell:

1. Page greeting/title and compact period selector.
2. Compact KPI row.
3. Sales-versus-expenses chart beside sales mix for owners.
4. Today's delivery queue beside low-stock and maintenance attention cards.
5. Top-five products for owners.

Staff should receive a balanced operational layout when financial sections are
absent; do not leave blank owner-only spaces.

Follow `docs/DESIGN.md` exactly:

- Poppins and existing `--app-*` tokens.
- Tailwind CSS for all new styling. Do not copy the reference's inline styles,
  create CSS Modules, or add `globals.css` rules when Tailwind can express them.
- Current compact stat-card sizes: roughly `15–16px` padding, `25px` values, and
  `28px` icon chips. Ignore the prototype's older oversized KPI dimensions.
- At most one featured blue-gradient KPI per row.
- shadcn/ui components where they fit and Lucide icons consistent with modules.
- Responsive grids that stack on narrow screens and never produce page-level
  horizontal overflow.
- Existing dark-mode tokens; no new token namespace or light-only surfaces.
- Lightweight accessible CSS/SVG charts; no new chart dependency. Provide text
  legends, values/tooltips, non-color cues, keyboard accessibility, and a
  screen-reader summary/table.
- Respect reduced motion.

Do not recreate or modify the global sidebar/header unless a small existing-shell
integration change is strictly required.

### 10. Loading, empty, and error states

Implement every state explicitly:

- Stable initial skeletons matching final card/chart dimensions.
- Non-blocking background-refresh feedback that retains prior values.
- True empty state when the organization has no completed deliveries/expenses.
- Selected-period empty state that keeps period controls available.
- Panel-specific empty states: no deliveries today, healthy stock, and no
  maintenance due.
- Zero-safe comparison states.
- Independent financial and operational errors with section-level retry.
- Owner/staff authorized layouts.
- Safe handling of malformed RPC responses.

An unauthorized financial request must not fall back to raw client aggregation
or display cached owner data to staff.

### 11. Verification

Place feature tests under `src/features/dashboard/tests/` and follow
`docs/TESTING.md`.

Automate at minimum:

- Date range/comparison helpers across Monday, month/year boundaries, leap day,
  and shorter previous months.
- Trend math for positive, negative, equal, zero, and missing baselines.
- Zod parsing/mapping, decimal quantities, and malformed RPC payloads.
- Query-key isolation by period/reference date.
- Service RPC names/parameters, safe errors, and staff skipping financials.
- Period switching and Today-only pending card.
- Owner/staff layouts, empty states, partial errors, retries, and chart labels.
- SQL aggregation, completed-at rules, deleted-row exclusion, deterministic top
  products, snapshot classification, and owner/tenant authorization.
- Targeted invalidation after relevant mutations.

Run and report:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Also manually verify:

- Owner and staff sessions in the same organization.
- Cross-organization UI and direct-RPC attempts.
- Staff cannot receive owner financial payloads.
- Light/dark themes, keyboard/screen-reader behavior, and reduced motion.
- Mobile, tablet, collapsed/expanded sidebar, and desktop layouts.
- Initial loading, refresh, true empty, period empty, panel empty, partial error,
  zero comparison, and populated states.
- Dashboard refresh/invalidation after delivery, expense, stock, and maintenance
  mutations.
- Query plans with realistic data volume and confirmation that raw source tables
  are not downloaded to the browser.

### 12. Final report

When finished, report:

- Files changed.
- Summary of behavior and interfaces.
- Assumptions made.
- Migration files/manual Supabase steps and whether they were applied.
- Commands run and exact typecheck/lint/test/build results.
- Manual RLS, role, responsive, dark-mode, accessibility, and state results.
- Remaining risks and deferred work, specifically POS/walk-in sales and the V1
  refill-unit classification limitation.

Do not claim completion while a required migration is unapplied or required
verification is still pending. Do not modify unrelated user changes in the dirty
worktree.

## END PROMPT
