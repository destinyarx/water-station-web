# Dashboard V1 — AI Agent Guide

## Purpose

This guide defines the recommended approach for replacing the protected
`/dashboard` placeholder with a real, organization-scoped Water Refilling
Station dashboard. It is written for the AI agent that will plan and implement
the feature later. It does not itself authorize application or database changes.

Dashboard V1 is an operational overview for a water station, not a generic
analytics template. It must help an owner understand revenue, expenses,
deliveries, refill activity, stock risk, and maintenance work without exposing
another organization's data or owner-only financial summaries to staff.

## 1. Source-of-truth order

When two sources disagree, use this order:

1. `AGENTS.md` and the project governance documents:
   `docs/CONSTITUTION.md`, `docs/ARCHITECTURE.md`,
   `docs/CODING_STANDARDS.md`, `docs/SECURITY.md`, and
   `docs/AI-GUARDRAILS.md`.
2. `CONTEXT.md`, `docs/DATABASE.md`, `docs/TESTING.md`, relevant ADRs, the live
   schema/RLS policies, and the completed Dashboard V1 spec artifacts.
3. `docs/DESIGN.md`, which is the design authority for the authenticated app.
4. `AquaFlow Dashboard.html`, which is composition and visual inspiration only.

The HTML reference is useful for its information hierarchy: greeting and period
control, compact KPI row, financial chart plus sales mix, delivery operations
plus attention rail, and top sellers. Do not copy its mock data, inline CSS,
unscoped token names, sidebar, header, or desktop-only assumptions.

## 2. Current repository state

- Dashboard V1 was implemented on 2026-07-17. The protected route is now a thin
  composition of `src/features/dashboard`; see `AI-HANDOFF.md` for entry points
  and remaining production sign-off.
- `/sales` is a heading-only stub. There is no approved Sales feature, sales
  service, or sales table.
- Completed deliveries and their `delivery_items` snapshots are the only current
  source that can support recognized Dashboard V1 revenue.
- Delivery schedule/item snapshots now retain `is_stock_tracked`, and client
  delivery creation/materialization carries it explicitly. Database triggers
  remain the authoritative write boundary.
- Expenses are stored in `public.expenses` with `date_incurred` and soft delete.
- Products already use `LOW_STOCK_THRESHOLD = 10`; Dashboard V1 must reuse that
  rule rather than creating a second threshold.
- The app already supplies the protected shell, sidebar, header, theme behavior,
  Clerk identity, and Supabase client. The dashboard body must compose inside
  that shell rather than recreate it.

## 3. V1 boundaries

### Included

- Completed-delivery revenue and expense comparison.
- Completed delivery, refill-unit, and pending-delivery metrics.
- Sales mix and top-five products derived from completed delivery lines.
- Today's delivery queue, low-stock alerts, and maintenance due.
- Owner and staff dashboard variants.
- Loading, partial-error, empty, and responsive states.

### Excluded

- Walk-in/POS sales, orders, payments, invoices, receivables, and profitability
  beyond delivery revenue minus recorded expenses.
- A new Sales module or speculative sales table.
- Forecasting, downloadable reports, custom date ranges, and user-configurable
  dashboard widgets.
- Product-name heuristics such as treating names containing `gallon` as refills.
- A new charting, state-management, or date library without explicit approval.

Call the financial metric **Delivery sales** or explain near the first financial
surface that V1 revenue comes from completed deliveries. Do not imply that it
includes unimplemented POS or walk-in transactions.

## 4. Roles and authorization

### Owner

Owners see both financial and operational content:

- Delivery sales.
- Sales versus expenses.
- Sales mix.
- Top five selling products.
- Pending and completed deliveries.
- Refill units.
- Today's delivery queue, low stock, and maintenance due.

### Staff

Staff see operational content only:

- Pending deliveries when Today is selected.
- Completed deliveries and refill units for the selected period.
- Today's delivery queue, low stock, and maintenance due.

Staff must not receive financial values in a response and then merely have them
hidden with CSS. The owner-financial database function must enforce the verified
owner claim/helper contract. The operational function may be available to any
organization member under RLS.

UI role checks improve the experience but never replace database authorization.
Neither function should accept `org_id`, `created_by`, or a role from the browser.
Tenant and user identity come from the authenticated Clerk/Supabase JWT and RLS.

## 5. Period contract

Use one shared type and query-key-safe value throughout the feature:

```ts
export type DashboardPeriod =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
```

Default to `today`. The selector labels are **Today**, **Yesterday**,
**This week**, and **This month**.

Use the project's existing `YYYY-MM-DD` ISO date-key convention. Pass a
`referenceDate` date key to dashboard services/RPCs so tests are deterministic;
do not call the current clock repeatedly in unrelated components and queries.
Use half-open ranges: `start <= value < endExclusive`.

### Selected ranges

| Period | Start | End exclusive |
| --- | --- | --- |
| Today | Reference date | Reference date + 1 day |
| Yesterday | Reference date - 1 day | Reference date |
| This week | Monday of the reference week | Reference date + 1 day |
| This month | First day of the reference month | Reference date + 1 day |

Weeks start on Monday. `this_month` is calendar-month-to-date, never a rolling
30-day window. Date helpers must cover month/year boundaries and leap years.

### Comparison ranges

- Today compares against yesterday, the same weekday one week earlier, and the
  same calendar day one month earlier. If that day does not exist in the prior
  month, clamp to that month's final day.
- Yesterday compares against the day immediately before it.
- This week compares its elapsed Monday-through-reference-day span with the
  matching Monday-through-weekday span in the immediately preceding week.
- This month compares month-to-date with the same ordinal span in the previous
  calendar month, clamped to that month's final day.

Aligned spans avoid comparing a partial current week/month with an entire prior
week/month.

### Trend semantics

For a non-zero baseline:

```txt
percentage = ((current - baseline) / abs(baseline)) * 100
```

Round only for display. Preserve unrounded numeric values in the result model.

- Baseline `0`, current `0`: neutral, label **No change**, no percentage.
- Baseline `0`, current above `0`: positive, label **New activity**, no infinity.
- Missing comparison data: unavailable, label **No comparison data**.
- Expenses use neutral language such as **higher/lower than**; do not imply that
  a higher expense is automatically a positive trend.

> **Feature 015 display refinement:** the aggregate contract may retain all
> comparison values, but KPI cards now display only Today versus Yesterday or
> Yesterday versus Today. This Week and This Month show no KPI comparison, and
> Pending Deliveries never shows one. The Sales versus Expenses panel has its
> own Weekly/Monthly selector; Monthly combines the bounded daily buckets into
> one month-to-date sales/expense pair.

The pending-delivery card is a live queue measure. Historical rows no longer
remain pending after status changes, so do not fabricate past pending trends
without an event/audit table.

## 6. Metric definitions

All delivery analytics must use active deliveries (`deleted_at is null`) whose
current status is `completed`, bounded by `completed_at`, not `delivery_date`.
This prevents scheduled-but-not-completed work from counting as revenue.

### KPI cards

| Metric | Definition | Role |
| --- | --- | --- |
| Delivery sales | Sum of `delivery_items.quantity * delivery_items.unit_price` for completed deliveries in the selected range | Owner |
| Pending deliveries | Count of active deliveries with `status = 'pending'` and `delivery_date = referenceDate`; render only for Today | Owner and staff |
| Completed deliveries | Count of active completed deliveries whose `completed_at` falls in the selected range | Owner and staff |
| Refill units | Sum of completed delivery-item quantity where the snapshotted `is_stock_tracked = false` | Owner and staff |

Format money as Philippine Peso. Quantities may be decimal in the schema; do not
silently coerce them to integers.

Dashboard V1 follows the requested rule that non-stock-tracked delivery
quantities represent refill units. The current product model also permits fees
and services to be non-stock-tracked, so the UI should say **Refill units** rather
than assert a physical gallon volume. A future product classification/unit model
is required before labeling every such unit as a gallon with complete accuracy.

### Sales versus expenses

- Sales are completed-delivery line totals in the selected period.
- Expenses are active `expenses.amount` values whose `date_incurred` falls in
  the selected date range.
- Today and Yesterday render one honest paired daily bucket because expenses
  have a date but no event timestamp.
- This Week renders one bucket per elapsed day from Monday.
- This Month renders one bucket per elapsed calendar day.
- Return zero-valued buckets so the chart does not shift or omit dates.

### Sales mix

Divide completed-delivery revenue into:

- **Refill services**: snapshotted `is_stock_tracked = false`.
- **Stock-tracked products**: snapshotted `is_stock_tracked = true`.

Return revenue and percentage for both groups. When total revenue is zero,
return both percentages as zero and show a chart-level empty state rather than
an artificial 50/50 donut.

### Top five products

- Include both stock-tracked and non-stock-tracked delivery items.
- Group by `product_id` so a renamed product is not counted as two products.
- Display the most recent snapshot name within the selected period.
- Rank by total units descending, then revenue descending, then display name
  ascending for deterministic ties.
- Return at most five rows with units, revenue, rank, and a bar percentage
  relative to the first row. Return an empty list when no completed lines exist.

### Operational panels

**Today's delivery queue**

- Use active deliveries scheduled for `referenceDate`.
- Show recipient, compact item summary, assignee when available, and current
  status. Order unfinished work before completed work and use existing status
  labels/colors. Limit the dashboard preview and link to `/deliveries`.

**Low stock**

- Use active, stock-tracked products with stock at or below the existing
  `LOW_STOCK_THRESHOLD` of `10`, including zero-stock items.
- Order zero stock first, then ascending stock, then product name. Limit the
  preview and link to `/products`.

**Maintenance due**

- Use active schedules/tasks, exclude cancelled and soft-deleted rows, and show
  pending tasks that are overdue or due within the next seven days.
- Order overdue first and then by `due_date`. Limit the preview and link to
  `/maintenances`.

## 7. Historical classification migration

Do not build durable refill/sales-mix analytics by joining every historical
delivery item to the product's current `is_stock_tracked` value. A product can be
edited or archived, which would rewrite or hide the meaning of past deliveries.

The recommended migration is to snapshot `is_stock_tracked` on both
`delivery_schedule_items` and `delivery_items`, update every materialization and
item-replacement path to copy it, and backfill existing snapshots from products
where possible. The migration must preserve RLS and atomic delivery functions.
Document any historical rows that cannot be classified accurately.

Before application code depends on this field, the implementing agent must:

1. Inspect the live Supabase columns, functions, grants, indexes, and policies.
2. Write reviewed migrations in the canonical `water-station-supabase`
   repository using its migration convention; keep only the runbook and context
   in this feature folder.
3. Update `docs/DATABASE.md` and relevant delivery documentation.
4. Ask the user to apply the migration in Supabase.
5. Wait for confirmation, then verify the live schema before dependent tests.

Never weaken RLS or use a service-role key to make aggregation work.

## 8. Query and performance strategy

### Database aggregation

Do not download all deliveries, items, expenses, products, and tasks and then
aggregate them in React. Use two bounded aggregate functions:

```txt
get_dashboard_financials(p_period text, p_reference_date date) -> jsonb
get_dashboard_operations(p_period text, p_reference_date date) -> jsonb
```

- Both functions are stable/read-only, `SECURITY INVOKER`, and execute only for
  `authenticated`.
- Both validate the active top-level Clerk `organization` claim, retain source
  RLS, and explicitly filter every source query to that UUID; neither accepts an
  org ID.
- The financial function must explicitly reject non-owner callers using the
  verified owner helper/claim contract.
- The operational function returns no sales, expense, mix, or product-revenue
  fields.
- Validate `p_period` against the four allowed values in SQL and again with Zod
  at the service boundary.
- Keep column selection and JSON payloads minimal.
- Inspect query plans and add only evidence-backed, partial/composite indexes;
  likely access paths are active deliveries by organization/status/completion
  time and active expenses by organization/date.

Separate functions enforce least privilege and allow one panel family to fail
without blanking the other.

### Client data flow

Use the standard flow:

```txt
dashboard UI -> TanStack Query hook -> dashboard service -> Supabase RPC
             -> RLS/role check -> validated aggregate response
```

Recommended query keys:

```ts
export const dashboardKeys = {
  all: ['dashboard'] as const,
  financials: (period: DashboardPeriod, referenceDate: string) =>
    [...dashboardKeys.all, 'financials', period, referenceDate] as const,
  operations: (period: DashboardPeriod, referenceDate: string) =>
    [...dashboardKeys.all, 'operations', period, referenceDate] as const,
}
```

- Fetch financial and operational queries in parallel for owners.
- Staff run only the operational query.
- Use a short non-zero `staleTime` (recommended: 60 seconds), keep previous data
  while switching periods when the existing TanStack Query version/pattern
  supports it, and show a subtle refreshing state rather than a full-page flash.
- Do not add polling by default. Refresh on focus and targeted invalidation are
  sufficient for V1.
- Invalidate dashboard keys after delivery create/edit/status changes, expense
  create/update/archive, product stock/status changes, and maintenance task
  completion/cancellation when those changes affect a visible panel.
- Prefer precise family invalidation; do not clear the entire query cache.

## 9. Result contracts

Keep database rows, validated service results, and view models distinct. The
exact file split should follow the existing feature structure, but the public
feature contracts should represent the following shapes without `any` or unsafe
assertions:

```ts
export type DashboardComparisonKey =
  | 'previous_day'
  | 'previous_week'
  | 'previous_month'
  | 'previous_period'

export interface DashboardTrend {
  key: DashboardComparisonKey
  current: number
  baseline: number | null
  percentage: number | null
  direction: 'up' | 'down' | 'neutral' | 'unavailable'
  label: string
}

export interface DashboardMetric {
  value: number
  trends: DashboardTrend[]
}

export interface DashboardChartBucket {
  key: string
  label: string
  sales: number
  expenses: number
}

export interface DashboardSalesMixItem {
  kind: 'refill_service' | 'stock_tracked_product'
  revenue: number
  percentage: number
}

export interface DashboardTopProduct {
  productId: number
  productName: string
  units: number
  revenue: number
  rank: number
  relativePercentage: number
}

export interface DashboardFinancials {
  period: DashboardPeriod
  referenceDate: string
  hasAnyFinancialActivity: boolean
  deliverySales: DashboardMetric
  expenses: DashboardMetric
  chart: DashboardChartBucket[]
  salesMix: DashboardSalesMixItem[]
  topProducts: DashboardTopProduct[]
}

export interface DashboardOperations {
  period: DashboardPeriod
  referenceDate: string
  hasAnyOperationalActivity: boolean
  pendingDeliveries: DashboardMetric | null
  completedDeliveries: DashboardMetric
  refillUnits: DashboardMetric
  deliveryQueue: DashboardDeliveryQueueItem[]
  lowStock: DashboardLowStockItem[]
  maintenanceDue: DashboardMaintenanceItem[]
}
```

Define the three operational item types explicitly from the minimal fields the
cards render. Zod must validate the unknown RPC payload before mapping it into
these camelCase contracts.

## 10. UI and design translation

Use `docs/DESIGN.md` rather than the HTML reference's local styles.

- Use Poppins and the authenticated `--app-*` tokens through Tailwind v4
  utilities. New dashboard code must not add inline styling, CSS Modules, or
  dashboard-specific rules to `globals.css` when Tailwind can express them.
- Use the current compact stat-card scale from `docs/DESIGN.md`: approximately
  `15px–16px` padding, `25px` numeric values, and `28px` icon chips. The HTML
  reference's `33px` KPI values and larger card spacing are not current.
- Use no more than one featured blue-gradient KPI card in a row.
- Use existing shadcn primitives for the period selector, skeletons, alerts,
  tooltips, and buttons where they fit.
- Use Lucide icons consistently with existing modules. Do not duplicate sidebar
  SVGs inside the dashboard body.
- Use responsive Tailwind grids: KPI cards auto-fit; two-column analysis and
  operations rows collapse to one column on narrow screens; controls wrap
  without horizontal page overflow.
- Preserve useful hierarchy from the reference: KPIs -> financial analysis ->
  operations/attention -> top products.
- Both themes must work through existing tokens. Do not create a third token
  namespace or hard-code light-only surfaces.
- Charts should be lightweight accessible SVG/CSS, not a new dependency. Include
  a text legend, visible values/tooltips, sufficient contrast, and an accessible
  summary or table for screen readers. Do not communicate series by color alone.
- Respect reduced motion and avoid decorative animation that delays reading.

## 11. States and failure handling

Do not use one generic “No data” message everywhere.

- **Initial loading:** render stable skeletons matching card/chart dimensions.
- **Background refresh:** keep prior values and show a non-blocking refresh cue.
- **True empty:** explain that completed deliveries/expenses have not been
  recorded yet and link to the relevant workflow when the role permits it.
- **Period empty:** state that the selected period has no activity; keep the
  selector usable and render zeros only where a zero is meaningful.
- **Panel empty:** use panel-specific messages such as “No deliveries scheduled
  today,” “Stock levels look healthy,” or “No maintenance due soon.”
- **Partial error:** financial and operational sections fail independently and
  provide a retry for only the failed query.
- **Unauthorized financial query:** treat it as an authorization failure, never
  fall back to client-side aggregation or show stale owner data to staff.
- **Invalid/unknown RPC response:** fail safely through Zod with a user-friendly
  message and retain detailed context only for development diagnostics.

## 12. Recommended implementation order

1. Finish `prd.md`, `REQUIREMENTS.md`, `ACCEPTANCE.md`, `research.md`, a technical
   plan, and small issue files under this spec folder.
2. Inspect the current code, live schema, RLS, functions, indexes, and existing
   delivery/expense/product/maintenance query patterns.
3. Prepare and hand off the snapshot/aggregate SQL migration; update database
   documentation and wait for application confirmation.
4. Add the focused `src/features/dashboard` contracts, Zod schemas, date helpers,
   query keys, services, and hooks.
5. Build the role-aware responsive dashboard body and replace the protected
   route's landing preview with thin feature composition.
6. Add targeted dashboard invalidation to existing feature mutations.
7. Run automated checks and the manual security/visual verification matrix.
8. Update the Dashboard spec and project documentation to match shipped behavior.

## 13. Testing matrix

### Automated

- Date ranges: Monday boundaries, month/year transitions, February and leap day,
  previous-month clamping, and aligned week/month-to-date comparisons.
- Trends: positive, negative, equal, zero baseline, missing baseline, and expense
  wording.
- Mappers/Zod: valid results, null comparisons, decimal quantities, missing
  fields, invalid period, and malformed RPC responses.
- Query keys: period and reference date isolation.
- Services: correct RPC/parameters, safe errors, staff does not call financials,
  and independent financial/operational failures.
- Components: period switching, Today-only pending card, owner/staff variants,
  all empty states, retry behavior, and accessible chart labels.
- SQL: completed-at filtering, soft-delete exclusion, expense date bounds,
  sales mix, deterministic top-five ranking, unclassified backfill behavior, and
  tenant/owner enforcement.

### Manual

- Owner and staff sessions in the same organization.
- Owner and staff sessions from different organizations; attempt direct RPC
  calls as well as UI access.
- Light/dark mode and keyboard/screen-reader navigation.
- Mobile, tablet, collapsed/expanded sidebar, and desktop layouts.
- Empty database, operational-only data, financial-only data, and fully populated
  data.
- Delivery completion/revert, expense mutation, stock adjustment, and maintenance
  completion followed by dashboard invalidation/refresh.
- Query-plan inspection with realistic row counts and confirmation that the
  dashboard does not download raw source tables.

## 14. Required implementation report

The implementing agent's final response must list:

- Files changed.
- Behavior and interfaces added.
- Assumptions made.
- Database migration/manual steps and whether they were applied.
- Commands run and lint/typecheck/test/build results.
- Manual RLS, role, responsive, dark-mode, loading/error/empty-state results.
- Remaining risks or deliberately deferred work, especially POS/walk-in sales
  and the limits of the V1 refill-unit definition.
