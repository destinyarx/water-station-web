# Slice 008 — Schedule management: pause, edit-future-only, owner-only archive

**Type:** AFK · **Epic:** `001-foundation.md`

## Parent

`docs/specs/004-deliveries-module/001-foundation.md`
PRD: `docs/specs/004-deliveries-module/deliveries-prd.md`

## What to build

Give owners and staff control over the lifecycle of a recurring schedule from the
"Schedules" tab. A schedule can be paused (`active → paused`) to stop new
occurrences while keeping existing ones and history, and resumed. Editing a
schedule's recurrence or template applies to **future** materialization only —
already-generated occurrences are untouched, and dropping a weekday leaves
existing pending rows in place. Archiving a schedule is a soft delete that is
**owner-only**: staff may edit and pause but cannot archive. Archiving stops
future generation and removes the schedule's future *pending* occurrences from
active lists while retaining completed/failed history.

Confirm the two lifecycles stay independent: a `failed` occurrence never changes
its schedule's status or future materialization — only an explicit pause does.

## Acceptance criteria

- [ ] Pausing a schedule stops new occurrences; existing ones remain; resuming
      restarts generation.
- [ ] Editing recurrence/template changes only future occurrences; a dropped
      weekday leaves existing pending rows in place.
- [ ] A staff user can edit and pause a schedule but cannot archive it; an owner
      can archive it (RLS owner-only soft-delete).
- [ ] Archiving removes future pending occurrences from active lists while
      completed/failed history remains.
- [ ] A failed occurrence does not pause or otherwise alter its schedule.
- [ ] Tests: service tests for pause/resume, future-only edit, owner-vs-staff
      archive authorization; manual RLS verification per
      `004-deliveries-schema.md` §7. Typecheck/lint/tests green.

## Blocked by

- `005-weekly-recurring-schedules-and-materialization.md`
