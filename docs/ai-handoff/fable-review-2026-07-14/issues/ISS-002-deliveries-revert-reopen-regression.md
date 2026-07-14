# ISS-002 — Deliveries: revert/reopen (ADR 0003 reversible terminal states) silently regressed; dead UI wiring remains

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P2 | Module: deliveries | Type: spec deviation + dead code | Effort: Low (either direction, once decided)

## Goal

Decide whether reverting a `completed`/`failed` delivery back to `pending` is still a supported capability (per the deliveries ADR on reversible terminal states), then either restore it or formally retire it — removing the dead UI wiring either way.

## Context

- The deliveries ADR history records that terminal statuses were reversible (`completed → pending`, etc.).
- Current code: `src/features/deliveries/deliveries.transitions.ts` defines `LEGAL_NEXT` with `completed: []` and `failed: []` — terminal states have **no** legal next states, so a revert can never happen.
- Yet `src/features/deliveries/components/delivery-history-dialog.tsx` (and the status menu it uses) still wires an `onReverted` callback. That callback can never fire. No ADR records the removal, so this looks like an accidental regression during feature 010's rebuild rather than a decision.

Evidence trail: `docs/ai-handoff/03-specification-status.md` row "Deliveries — stock-at-dispatch + reversible terminal states".

## Decision point (product owner)

- **Option A — restore revert**: add the allowed reverse transitions back to `LEGAL_NEXT` (e.g. `completed: ['pending']`, `failed: ['pending']`), and define what happens to stock that was deducted at dispatch when a completed delivery is reverted (must be answered before implementing — see stock-at-dispatch logic in `delivery-status.service.ts`).
- **Option B — retire revert**: keep `LEGAL_NEXT` as-is, delete the `onReverted` wiring from `delivery-history-dialog.tsx` and the status menu, and write a short ADR in `docs/adr/` recording that terminal states are now final (superseding the earlier decision).

## Steps (after decision)

1. Read `deliveries.transitions.ts`, `delivery-history-dialog.tsx`, `delivery-status.service.ts`, and the tests in `src/features/deliveries/tests/` before changing anything.
2. Apply the chosen option. For Option A, add/extend transition unit tests covering the revert path **and** the stock re-add behavior. For Option B, remove dead props/handlers and run the existing test suite.
3. Update `docs/ai-handoff/03-specification-status.md`'s deliveries row and the relevant spec under `docs/specs/010-rebuild-ui-ux-deliveries-module/` with a dated note.

## Acceptance criteria

- If Option A is chosen, when an owner/staff opens the status menu on a `completed` delivery, the system shall offer a revert action that returns the delivery to `pending` and reconciles stock, covered by a unit test.
- If Option B is chosen, the system shall contain no `onReverted` wiring, and a new accepted ADR shall record the retirement.
- In both options, `npm run test`, `npm run lint`, and `npx tsc --noEmit` shall pass.

## Files

- `src/features/deliveries/deliveries.transitions.ts`
- `src/features/deliveries/components/delivery-history-dialog.tsx` (+ status menu component)
- `src/features/deliveries/services/delivery-status.service.ts` (Option A only)
- `src/features/deliveries/tests/*`
- `docs/adr/` (Option B), spec docs

## Breakage check

Deliveries is the most complex module (recurrence + stock deduction). Option A touches stock logic — do not implement it without answering the stock-reconciliation question first. Option B is removal of provably-dead code paths; verify with a grep that nothing else consumes `onReverted` before deleting.
