# Slice 004 — Delivery status lifecycle

**Type:** AFK · **Epic:** `001-foundation.md`

## Parent

`docs/specs/004-deliveries-module/001-foundation.md`
PRD: `docs/specs/004-deliveries-module/deliveries-prd.md`

## What to build

Let staff move a delivery occurrence through its operational lifecycle from the
occurrence table. A status-aware row-action menu offers only the transitions that
are legal from the row's current status: `pending → for_delivery → completed`,
with `→ failed` available from `pending` or `for_delivery`. Moving to
`for_delivery` auto-stamps `delivered_by` with the acting Clerk user. Marking a
delivery `failed` opens a dedicated dialog requiring non-empty `failure_remarks`
(submit disabled until filled). `completed` and `failed` are terminal — no menu
option reverts them. General `notes` remain editable and are distinct from
failure remarks.

A pure transition guard (`canTransition(from, to)` / terminal-status check)
backs both the menu and the service so illegal jumps are impossible in UI and
data.

## Acceptance criteria

- [ ] The row menu shows only legal next statuses for the current status.
- [ ] `pending → for_delivery` is one click and stamps `delivered_by` with the
      acting user.
- [ ] `for_delivery → completed` succeeds and is terminal.
- [ ] "Mark as failed" requires remarks (form + DB CHECK); saved failed status is
      terminal.
- [ ] Status chips reflect current state; general notes can be edited
      independently of failure remarks.
- [ ] Tests: transition guard (legal/terminal) with prior art
      `customers.guards.test.ts`; service test that status update stamps
      `delivered_by` and rejects failed-without-remarks. Typecheck/lint/tests
      green.

## Blocked by

- `003-one-time-delivery-create-and-list.md`
