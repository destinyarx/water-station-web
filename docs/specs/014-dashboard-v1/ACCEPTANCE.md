# Dashboard V1 Acceptance Criteria

## Database and security

- [ ] **A-001** Both classification columns exist, are non-null, and new schedule
  and occurrence item paths preserve the intended snapshot.
- [x] **A-002** Existing item rows are backfilled; the documented historical
  limitation is visible to maintainers.
- [ ] **A-003** Both dashboard functions reject an unsupported period.
- [ ] **A-004** Both functions run as `SECURITY INVOKER`, are executable by
  `authenticated`, and are not executable by `anon` or `public`.
- [ ] **A-005** A staff direct call to `get_dashboard_financials` is rejected.
- [ ] **A-006** An org A caller receives no org B values from either function.
- [ ] **A-007** The operational JSON contains no price, revenue, sales, expense,
  or sales-mix field.
- [ ] **A-008** Soft-deleted deliveries, expenses, products, schedules, and tasks
  do not affect active dashboard results.

## Period and metric behavior

- [x] **A-009** Today, Yesterday, This week, and This month use the documented
  half-open calendar ranges with Monday-start weeks.
- [x] **A-010** Today returns yesterday, previous-weekday, and clamped
  previous-month-day comparisons.
- [x] **A-011** Week/month-to-date comparisons use matching elapsed spans across
  month/year boundaries, leap day, and shorter previous months.
- [x] **A-012** Equal zero values show `No change`; positive current activity
  over zero shows `New activity`; no UI displays infinity or NaN.
- [ ] **A-013** Delivery sales equals completed delivery snapshot quantity times
  snapshot unit price and is bounded by `completed_at`, not `delivery_date`.
- [x] **A-014** Pending deliveries appears only for Today and reflects current
  `pending` rows scheduled on the reference date.
- [x] **A-015** Completed deliveries and refill units preserve decimal values and
  match the selected period.
- [x] **A-016** Sales-versus-expenses returns every elapsed day, including zero
  buckets.
- [x] **A-017** Zero sales mix shows an empty state instead of a 50/50 chart.
- [x] **A-018** Top products returns at most five deterministic rows ranked by
  units, revenue, and name.

## Roles and interface

- [x] **A-019** An owner sees financial and operational sections.
- [x] **A-020** A staff member sees only operational sections and no owner-only
  placeholder gaps.
- [x] **A-021** Period switching changes both query keys and visible metrics;
  switching away from Today removes the pending card.
- [x] **A-022** Initial skeletons, background refresh, true empty, selected-period
  empty, and each panel-empty state are distinguishable.
- [x] **A-023** Financial and operational errors can be retried independently.
- [x] **A-024** Malformed RPC JSON fails safely with user-friendly copy.
- [x] **A-025** Charts have text legends/values and screen-reader summaries.
- [ ] **A-026** Light/dark modes, reduced motion, keyboard navigation, and focus
  indicators remain usable.
- [ ] **A-027** Mobile, tablet, collapsed/expanded sidebar, and desktop layouts
  have no page-level horizontal overflow.

## Integration and verification

- [x] **A-028** Relevant delivery, expense, product, and maintenance mutations
  invalidate the intended dashboard keys without clearing the whole cache.
- [x] **A-029** The browser downloads only bounded RPC JSON, not raw analytics
  source tables.
- [x] **A-030** `npm run typecheck`, `npm run lint`, `npm run test`, and
  `npm run build` pass after the live migration is applied and verified.
- [ ] **A-031** The completion report records live RLS/role attempts, responsive,
  dark-mode, accessibility, empty/error state, and query-plan results.
- [x] **A-032** Both delivery `schedule_id` foreign keys reference
  `delivery_schedules(id)`, validate successfully, and no orphan is guessed or
  silently discarded.
- [ ] **A-033** The only source-table policy changed by the prerequisite is the
  users SELECT policy, and all dashboard source tables retain enabled RLS.
- [ ] **A-034** A caller with memberships in two organizations receives values
  only for the active top-level Clerk organization claim.
- [x] **A-035** Financial and operational activity flags distinguish true-empty
  from period-empty states without adding financial fields to operations.
