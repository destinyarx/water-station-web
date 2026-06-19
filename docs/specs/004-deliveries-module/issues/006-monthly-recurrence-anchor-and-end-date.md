# Slice 006 — Monthly recurrence + start anchor + end date

**Type:** AFK · **Epic:** `001-foundation.md`

## Parent

`docs/specs/004-deliveries-module/001-foundation.md`
PRD: `docs/specs/004-deliveries-module/deliveries-prd.md`

## What to build

Extend recurring scheduling with the monthly mode and the date boundaries that
apply to all recurring schedules. The Schedule section gains a monthly option:
`day_of_month` (1–31) + `interval_months` (1 = every month), anchored on
`start_date`. When `day_of_month` exceeds the days in a target month, the
occurrence is clamped to that month's last day. A user-editable `start_date`
(default today) anchors all interval math, and an optional `end_date` stops a
recurring schedule from producing occurrences after that date.

The materialization generator is extended to handle monthly due dates, month-end
clamping, the `start_date` anchor, and the `end_date` cutoff.

## Acceptance criteria

- [ ] A monthly schedule on a chosen day materializes on that day each month
      (respecting `interval_months`).
- [ ] A monthly schedule set to day 31 materializes on the last day of shorter
      months (e.g. Feb).
- [ ] `start_date` anchors interval calculations; changing it shifts the
      generated dates accordingly.
- [ ] A schedule with `end_date` produces no occurrence after that date.
- [ ] Tests: monthly generation, month-end clamp, end_date boundary, anchor
      behavior added to the pure date-generation suite. Typecheck/lint/tests
      green.

## Blocked by

- `005-weekly-recurring-schedules-and-materialization.md`
