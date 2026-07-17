# Technical Plan

## Status

Implemented on 2026-07-18. Typecheck, focused tests, the full 64-file/286-test
suite, lint (zero errors; existing warnings remain), and the production build
pass. Signed-in browser QA remains manual because no in-app browser session was
available.

## Dashboard

1. Add a chart coverage type (`weekly | monthly`) and pure chart bucket
   aggregation helper.
2. Keep the page-wide financial/operations queries unchanged. Add an
   owner-only chart financial query keyed by `this_week` or `this_month`, plus
   Today comparison queries enabled only while Yesterday is selected.
3. Replace multi-chip KPI trends with one human-readable comparison helper for
   Today/Yesterday and no comparison for Pending/Week/Month.
4. Extend the non-featured StatCard decoration with tone-specific glow and SVG
   wave layers while preserving compact dimensions.
5. Add a native select to the Sales versus Expenses panel header and aggregate
   monthly buckets into one month-to-date bucket.
6. Refine operational panel title/action hierarchy without changing their data.

## Deliveries

1. Fix `ConfirmDialog` so description and body render as distinct slots.
2. Add a focused regression test proving both cancellation copy and reason field
   render together.
3. Route non-remark status changes through a status-specific ConfirmDialog and
   pass resolved recipient metadata from desktop/mobile table rows.
4. Preserve the existing fail/cancel reason dialogs and atomic mutation hook.
5. Wrap the existing multi-date calendar in Radix Popover; keep the selection
   count in the trigger and calendar footer.

## Verification

- Focused dashboard and delivery Vitest suites.
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- Manual signed-in role/theme/responsive/keyboard QA.
