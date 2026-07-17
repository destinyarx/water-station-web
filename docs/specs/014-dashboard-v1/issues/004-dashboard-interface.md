# 004 — Role-aware dashboard interface

## Goal

Replace the static preview with the responsive owner/staff dashboard.

## Deliverables

- Thin protected route and feature page composition.
- Compact KPI, owner analytics, operations/attention, and top-products sections.
- Tailwind/token-based accessible charts.
- Loading, refreshing, empty, partial-error, retry, and malformed-response states.

## Dependency

Issue 003.

## Done when

- [x] The protected route is a thin feature import.
- [x] Owner financial and shared operational sections are role-aware.
- [x] Period, KPI, chart, queue, low-stock, and maintenance panels are present.
- [x] Section-local loading, refresh, error/retry, true-empty, period-empty, and
  panel-empty states are implemented.
- [x] Charts expose text values and screen-reader descriptions without a chart
  dependency.
- [ ] Signed-in responsive/theme/keyboard browser QA is captured.
