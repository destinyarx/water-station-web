# Dashboard V1 Requirements

These are testable EARS-style requirements. “System” means Dashboard V1 and its
database functions.

## Access and security

- **R-001** When an authenticated organization owner opens `/dashboard`, the
  system shall request the financial and operational dashboard payloads in
  parallel.
- **R-002** When an authenticated staff member opens `/dashboard`, the system
  shall request only the operational dashboard payload.
- **R-003** If a non-owner calls the financial dashboard function directly, the
  database shall reject the request without returning financial values.
- **R-004** Where dashboard data is queried, the system shall derive tenant and
  user scope from the authenticated JWT and RLS, explicitly constrain every
  source query to the active organization claim, and shall not accept `org_id`,
  `created_by`, user ID, or role parameters.
- **R-005** Where source tables support soft deletion, the system shall exclude
  soft-deleted records from active metrics and panels.
- **R-006** The operational payload shall not contain sales, expenses, sales
  mix, product revenue, or other financial fields.

## Periods and comparisons

- **R-007** When the page first renders, the system shall select `today` and use
  one deterministic `YYYY-MM-DD` reference date for all dashboard queries.
- **R-008** When a user changes the period, the system shall support only
  `today`, `yesterday`, `this_week`, or `this_month`.
- **R-009** Where a period is calculated, the system shall use a half-open range
  and Monday-start calendar weeks.
- **R-010** When `this_week` is selected, the system shall include Monday through
  the reference date and compare it with the matching elapsed span one week
  earlier.
- **R-011** When `this_month` is selected, the system shall include the first day
  of the calendar month through the reference date and compare it with the
  matching ordinal span in the previous calendar month, clamped at month end.
- **R-012** When `today` is selected, the system shall provide comparison values
  for yesterday, the same weekday one week earlier, and the clamped same
  calendar day one month earlier.
- **R-013** When both current and baseline values are zero, the system shall
  describe the trend as `No change` and shall not return a percentage.
- **R-014** When a zero baseline has positive current activity, the system shall
  describe the trend as `New activity` and shall not return an infinite
  percentage.
- **R-015** If comparison data is unavailable, the system shall describe it as
  `No comparison data`.

## Metrics and analytics

- **R-016** When calculating Delivery sales, the system shall sum completed
  delivery item snapshot quantity multiplied by unit price within the selected
  `completed_at` range.
- **R-017** When Today is selected, the operational payload shall include the
  count of active `pending` deliveries scheduled on the reference date.
- **R-018** When a period other than Today is selected, the system shall omit
  the pending-deliveries metric rather than fabricate historical pending state.
- **R-019** When calculating completed deliveries, the system shall count active
  deliveries whose current status is `completed` and whose `completed_at` is in
  the selected range.
- **R-020** When calculating refill units, the system shall sum decimal delivery
  item quantities whose stored classification snapshot is false and whose
  parent delivery satisfies R-019.
- **R-021** When building sales-versus-expenses buckets, the system shall use
  completed delivery sales and active expenses by `date_incurred`, returning a
  zero-valued bucket for every elapsed date in the selected range.
- **R-022** When the selected period is Today or Yesterday, the system shall
  return one paired daily chart bucket.
- **R-023** When building sales mix, the system shall return refill-service and
  stock-tracked revenue plus percentages based on stored classification
  snapshots.
- **R-024** If sales-mix revenue is zero, the system shall return zero
  percentages and the UI shall show an empty chart state.
- **R-025** When ranking products, the system shall group by `product_id`, use
  the most recent snapshot name in the period, order by units then revenue then
  name, and return at most five rows.

## Operational panels

- **R-026** When the dashboard loads, the system shall return a bounded preview
  of active deliveries scheduled for the reference date with recipient, item
  summary, assignee when available, and status, ordered with unfinished work
  first.
- **R-027** When low stock is queried, the system shall return active,
  stock-tracked products with stock `<= 10`, ordering zero stock first and then
  stock and product name ascending.
- **R-028** When maintenance attention is queried, the system shall return
  active, pending, non-deleted tasks that are overdue or due no later than seven
  days after the reference date, ordered overdue/earliest first.

## Data architecture

- **R-029** When a delivery schedule item is created, the system shall snapshot
  the selected product's `is_stock_tracked` value.
- **R-030** When a delivery item is materialized or replaced, the system shall
  preserve the schedule snapshot where available and otherwise snapshot the
  selected product's current classification.
- **R-031** The database shall expose
  `get_dashboard_financials(text,date)` and
  `get_dashboard_operations(text,date)` as stable, read-only,
  `SECURITY INVOKER` functions granted only to `authenticated`.
- **R-032** When an RPC payload reaches the dashboard service, the system shall
  validate the unknown response with Zod before mapping it to camelCase feature
  contracts.
- **R-033** When a dashboard query is cached, its query key shall include the
  period and reference date and use a 60-second stale time.
- **R-034** When relevant delivery, expense, product, or maintenance mutations
  succeed, the system shall invalidate only affected dashboard query families.

## Interface and states

- **R-035** The protected dashboard route shall remain a thin composition of the
  `src/features/dashboard` module.
- **R-036** Where new dashboard UI is styled, the system shall use Tailwind and
  existing `--app-*` tokens without new global CSS or a chart dependency.
- **R-037** While initial data is loading, the system shall render stable
  skeletons matching the final section dimensions.
- **R-038** While a period query refreshes, the system shall retain prior data
  and show non-blocking refresh feedback.
- **R-039** If financial or operational loading fails, the system shall keep the
  other successful section visible and offer a section-specific retry.
- **R-040** When an organization or selected period has no applicable data, the
  system shall show true-empty, period-empty, or panel-specific copy while
  keeping period controls available.
- **R-041** Where charts communicate values, the system shall provide visible
  labels and a screen-reader-readable summary that does not depend on color.
- **R-042** At mobile, tablet, and desktop widths, the dashboard shall avoid
  page-level horizontal overflow and shall rebalance the staff layout when
  financial sections are absent.

## Migration prerequisites

- **R-043** Before Dashboard V1 snapshots are backfilled, the database shall
  reject orphaned delivery/template rows and constrain both child
  `schedule_id` columns to `delivery_schedules(id)`.
- **R-044** When an authenticated user reads `public.users`, its SELECT policy
  shall require the top-level active organization claim and verified membership
  in that organization.
- **R-045** Each dashboard payload shall include only its role-appropriate
  all-time activity boolean so the interface can distinguish a new station from
  a selected period with no activity.
