# Slice 005 — History modal (completed + failed) + revert from history

**Type:** AFK · **Feature:** `005-deliveries-module-continuation`

## Parent

PRD: `docs/specs/005-deliveries-module-continuation/prd.md`
ADR: `docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md`

Stories: 21, 22, 23.

## What to build

A **History** modal that gets finished work out of the main queue while keeping
it reviewable and reversible.

End-to-end behavior:

- A modal lists `completed` + `failed` occurrences only, sorted most-recent
  first (by `completed_at` then `delivery_date`). Rows are **read-only** except
  the status revert action.
- Failed rows show their `failure_remarks`; completed and failed rows are
  **visually distinct** (e.g. status badge variants) so outcomes scan quickly.
- Reverting a row reuses the revert transitions from slice 003
  (`resolveStatusTransition` + the same stock/field effects); on success the row
  leaves History and reappears in the current queue, and both views'
  query keys are invalidated.
- **Server-side prev/next pagination** via the shared `applyLimitPlusOne` helper
  from slice 004 (no total count).
- Org-scoped reads under RLS; soft-deleted rows excluded. Handle loading, error,
  and empty states.

## Acceptance criteria

- [ ] The modal shows only `completed` + `failed` rows, most-recent first, and
      never `pending`/`for_delivery`.
- [ ] Failed rows display `failure_remarks`; completed vs failed are visually
      distinguishable.
- [ ] Reverting from History moves the row through `resolveStatusTransition`
      (slice 003 logic), applies the correct stock/field effects, removes it from
      History, and surfaces it in the current queue.
- [ ] The modal paginates prev/next through `applyLimitPlusOne` with no
      total-count query.
- [ ] Loading, error, and empty states exist; reads are org-scoped.
- [ ] Typecheck, lint, and tests pass; no `any`, no `@ts-ignore`.

## Blocked by

- `003-reversible-terminal-states-and-pending-only-editing.md` (revert logic).
- `004-current-queue-today-cards-and-pagination.md` (`applyLimitPlusOne`).
