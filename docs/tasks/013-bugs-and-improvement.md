# 013 — Bugs and improvements

Sharpened 2026-07-15 via a grilling session. Decisions recorded in
**ADR 0015** (`docs/adr/0015-shared-operational-queue-rls.md`); domain language
in `CONTEXT.md`.

## Goal

Fix the issues found in the 2026-07-14 handoff review, without breaking working
behaviour. Run `npm run lint`, `npm run typecheck`, `npm run test` after changes.

## Root cause (found during grilling)

Three separately-reported bugs are **one defect**:

- Maintenance "complete" does nothing
- Maintenance "set inactive" does nothing
- Product delete does nothing

All three report success and change neither UI nor database. Cause:

1. `migrations/[skip] 004-shared-operational-queue-rls.sql` was **never applied**.
2. The surviving pre-004 policies allow updates only for an org admin **or** the
   row's creator. Staff acting on an owner-created row fail the `USING` check.
3. An RLS `USING` miss does not raise — it matches **zero rows**, and PostgREST
   returns `error: null`.
4. Every service checks only `error`, so it reports success. `invalidateQueries`
   then refetches the unchanged row.

The doc originally blamed migration `003`. **003 is innocent** — it only installs
`updated_at` triggers. Invalidation was never broken either; every hook already
calls `invalidateQueries` correctly. That is exactly why this was hard to see.

## Decisions

| Question | Decision |
|---|---|
| Migration 004 | **Do not apply — it is broken.** Superseded by a new migration. See ADR 0015. |
| Silent zero-row writes | Guard every service where a client guard can actually work. |
| Product delete by staff | Stays owner-or-creator. Not a bug — fix the false toast. |
| Product discontinue (`is_active`) | Owner-or-creator, falls out of 004's guard. |
| Stock adjustment | Any org member, any product. Inline `+`/`−`, **no ledger**. |
| Maintenance task complete | Any org member (unblocks the assignee). |
| Schedule pause/resume | Any org member. Archive stays owner-only. |
| Board *All* filter | Live work only — excludes inactive **and** completed. |
| History modal | Server-paginated via `.range()`. Named *History*, per deliveries. |
| Cache | `staleTime` 5min / `gcTime` 10min, set once on the QueryClient. |
| Tailwind refactor | Strict — only files already opened for a listed fix. |

## Work

### 1. RLS + silent writes (do first — unblocks the bugs)

- [x] **Write guards** — `.select('id')` + throw on empty, in `maintenance`
  (updateSchedule ×2, setScheduleStatus, completeTask ×2), `products`
  (setProductStatus), `customers` (setCustomerStatus), `deliveries`
  (pauseSchedule, resumeSchedule), `documents` (file_path). New
  `*_NOT_PERMITTED_ERROR` constants per feature. Guards run *before* dependent
  writes (roll-forward, materialize, occurrence archive).
  Expenses and notifications needed no change — already `.select().single()`.
  Archive paths deliberately unguarded: the SELECT policy hides the row they
  just wrote, so triggers report those instead. See ADR 0015 → *Write guards*.
- [ ] **Apply the migration** — `supabase/migrations/20260715000000_shared_operational_queue_rls.sql`.
  **A human runs this** (ADR 0012). The old `[skip] 004-…` must never be run:
  its `WITH CHECK` makes soft-delete impossible for everyone.

### 2. Products

- [x] **Row-action menu clipping.** Confirmed and fixed. The menu sat inside two
  `overflow: hidden` ancestors — the card (`products-table.tsx` line 50) and the
  104px banner (line 52) — so it was sliced at the banner's edge, leaving only
  *Edit product* visible. Both clips are load-bearing (they round the banner), so
  the menu now renders through `createPortal` to `document.body`, pinned to the
  button with `position: fixed` and repositioned on scroll/resize. Added Escape
  to close.
- [x] **Discontinue / reactivate** — already wired (`product-row-actions.tsx`
  lines 72–83). No change needed.
- [ ] Inline `+`/`−` stock adjustment writing `products.stock`. No history table.

### 3. Maintenance

- [x] **Inactive filter tab** replaces the "Show Inactive" checkbox.
- [x] ***All* = live work only.** *Completed* tab removed. `matchesFilter` is
  exported and tested: *All* excludes both completed occurrences and paused
  schedules; *Inactive* shows pending work on paused schedules only.
- [x] **History** button beside *Schedule Task*, opening a server-paginated modal
  (`maintenance-history-dialog.tsx`), mirroring `delivery-history-dialog.tsx`.
  New `maintenance-history.service.ts` pages completed occurrences with the same
  limit-plus-one probe; `!inner` join drops archived schedules' tasks. Names are
  joined in `buildHistoryEntries` (a pure, tested view fn) rather than in the
  query, so a cached page can't go stale against the org-users list.
- [x] **Complete action redesigned** — outline control on theme tokens instead of
  a gradient pill, so it reads as a row control and follows dark mode.
- [x] **Stats card** matches the deliveries board: featured gradient lead card +
  description lines + loading dashes. *(Added — not in the original list.)*

### 4. Customers

- [x] **Column alignment.** Root cause: `GRID` used a `max-content` track while
  **each row is its own grid**, so that column resolved to a different width per
  row and dragged the `fr` tracks with it. Now a definite `170px`; the contact
  cell ellipsises like the address one already did.

### 5. Documents

- [x] **Document date defaults to today**, still editable. `DOCUMENT_FORM_DEFAULTS`
  became `documentFormDefaults()` — a module const would freeze the date at
  import. Uses `toLocaleDateString('en-CA')` for a local `YYYY-MM-DD`;
  `toISOString()` would show yesterday in PH before 8am.
- [x] **Amount** — already optional in schema and label. No change needed.
- [x] **Progress bar removed** from the stats card.
- [x] **Stats card restyled** to match deliveries, incl. the gradient lead card.

### 6. Deliveries

- Make *Custom dates* a calendar **popover**, not an inline block.
  `unified-delivery-form.tsx` 506–574. Keep multi-select; keep past dates
  disabled (today and future only).

### 7. Cross-cutting

- Reload button on every feature datatable — forces a refetch.
- Cache TTL as decided above.
- `docs/DESIGN.md`: add the rule to always prefer Tailwind over plain CSS.

## Not doing

- **Heap OOM.** The trace shows ~34min uptime (`2,016,025ms`) on a dev server.
  Next dev + HMR leaking over a long session is the usual cause and is often not
  an app bug. Not chased without a reproduction; revisit if it hits prod or CI.
- **Stock ledger.** Explicitly rejected — inline `+`/`−` keeps no history. If
  "who took 20 bottles out on Tuesday" ever matters, that history cannot be
  backfilled. See CONTEXT.md → *Stock adjustment*.
- Original items 4–7 (`Module:`, `gfh`, `f`, `h`) were unfinished placeholders
  and have been removed. "Deleting a patient" was a copy-paste slip for
  *product*.
