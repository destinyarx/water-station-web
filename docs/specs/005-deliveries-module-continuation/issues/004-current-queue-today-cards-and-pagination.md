# Slice 004 — Current queue (model B) + today cards + pagination foundation

**Type:** AFK · **Feature:** `005-deliveries-module-continuation`

## Parent

PRD: `docs/specs/005-deliveries-module-continuation/prd.md`
ADR: `docs/specs/005-deliveries-module-continuation/adr-0003-delivery-status-stock-and-revert.md`

Stories: 1, 2, 3, 24, 28.

## What to build

Reshape the deliveries landing page around the **current delivery queue** and
establish the **server-side pagination** path that all three datatables reuse.

End-to-end behavior:

- The main datatable reads from the `v_current_deliveries` view (model B:
  overdue + due-today + each active schedule's single nearest-upcoming
  `pending`/`for_delivery` occurrence). Far-future occurrences do **not** appear
  until they become the nearest upcoming run.
- **Server-side pagination**, prev/next only (no total count, no page numbers):
  fetch `pageSize + 1` rows via `.range(offset, offset + pageSize)`; if the extra
  row came back there is a next page — drop it before render. Put this in a pure
  `applyLimitPlusOne(rows, pageSize)` helper that returns `{ rows, hasNext }`.
  This helper is the shared foundation for slices 005 and 008's tables.
- **Three today-scoped metric cards**, each a bounded
  `count: 'exact', head: true` query:
  - **Active (today):** `pending` AND `delivery_date = today`.
  - **Pending (backlog):** `pending` AND `delivery_date` in `[today−7, today−1]`.
  - **Completed (today):** `completed` AND `completed_at::date = today`.
  - Replaces the old "Reference data" card; balanced spacing, distinct icons,
    clear "today" labelling.
- All reads stay org-scoped (the view is `security_invoker`; cards query base
  tables under RLS). Soft-deleted rows excluded.
- Handle loading, error, and empty states for the table and each card.

## Acceptance criteria

- [ ] The main table is sourced from `v_current_deliveries` and shows overdue,
      due-today, and exactly one nearest-upcoming row per active schedule — never
      the full future horizon.
- [ ] `applyLimitPlusOne` is a pure, tested helper: `hasNext = true` and the
      extra row dropped when `pageSize + 1` rows are supplied; `hasNext = false`
      otherwise.
- [ ] The table pages forward and back via `.range(...)` with no total-count
      query; prev disabled on page 0, next disabled when `hasNext` is false.
- [ ] The three cards show the correct today-scoped counts using bounded
      `head: true` count queries; the old "Reference data" card is gone.
- [ ] Loading, error, and empty states exist for the table and the cards.
- [ ] Every query is org-scoped; no cross-org rows appear.
- [ ] Typecheck, lint, and tests pass; no `any`, no `@ts-ignore`.

## Blocked by

- `001-schema-migration-completed-at-and-current-queue-view.md` (needs
  `v_current_deliveries` and `completed_at`).
