# ISS-003 — Deliveries: monthly recurrence fields exist in schema but are unimplemented

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P3 | Module: deliveries | Type: spec deviation / dead schema | Effort: Low (retire) or High (implement)

## Goal

Decide whether monthly delivery recurrence is still planned. Either implement it or remove/deprecate the dead schema fields so the schema stops implying a feature that doesn't exist.

## Context

- `src/features/deliveries/deliveries.recurrence.ts` — `dueDatesFor()` returns `[]` immediately for any frequency other than `weekly`. Monthly recurrence is therefore a no-op.
- The schema still carries `day_of_month` / `interval_months`-style fields, implying monthly support. A future agent (or form change) could expose a "monthly" option in the UI that silently produces zero occurrences.

Evidence: `docs/ai-handoff/03-specification-status.md` row "Deliveries — monthly recurrence"; tests in `src/features/deliveries/tests/deliveries.recurrence.test.ts`.

## Decision point (product owner)

- **Option A — implement monthly**: extend `dueDatesFor()` with monthly logic (day-of-month clamping for short months, interval handling), plus form support and tests. High effort; only worth it if customers actually need monthly refill schedules.
- **Option B — retire monthly for now**: keep `dueDatesFor()` weekly-only, ensure the schedule form cannot select a monthly frequency, and mark the schema fields deprecated in `docs/DATABASE.md` (do **not** drop columns directly — if dropping is desired, open a separate migration ticket per project rules).

## Steps (after decision)

1. Read `deliveries.recurrence.ts`, the schedule form component, `deliveries.schema.ts`, and existing recurrence tests.
2. Option A: implement with exhaustive unit tests (month lengths 28/29/30/31, interval > 1, DST-safe date math consistent with the existing weekly logic). Option B: add a guard/comment at the top of `dueDatesFor()` stating weekly-only is intentional, verify the form's frequency options, and annotate `docs/DATABASE.md`.
3. Add a dated note to the deliveries spec folder recording the decision.

## Acceptance criteria

- If Option A: when a monthly schedule is created with `day_of_month = 31`, the system shall materialize occurrences on the last day of shorter months (or the documented clamping rule), covered by unit tests.
- If Option B: the schedule form shall not offer a monthly frequency, and `docs/DATABASE.md` shall mark the monthly fields as deprecated/unused with a "fable 2026-07-14" note.
- `npm run test` / lint / typecheck pass either way.

## Files

- `src/features/deliveries/deliveries.recurrence.ts`
- `src/features/deliveries/tests/deliveries.recurrence.test.ts`
- Schedule form component under `src/features/deliveries/components/`
- `docs/DATABASE.md` (Option B annotation)

## Breakage check

Option B is low risk if the form already can't select monthly — verify that first; if it can, that's a live bug (schedules that generate nothing) and raises this ticket's priority. No DB change in either option without a separate migration ticket.
