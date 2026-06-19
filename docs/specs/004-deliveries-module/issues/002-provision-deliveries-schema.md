# Slice 002 — Provision deliveries schema

**Type:** HITL · **Epic:** `001-foundation.md`

## Parent

`docs/specs/004-deliveries-module/001-foundation.md`
PRD: `docs/specs/004-deliveries-module/deliveries-prd.md`

## What to build

Stand up the database layer for the Deliveries module so every later slice has
real tables to read and write. Run the migration document
`docs/specs/004-deliveries-module/004-deliveries-schema.md` in the Supabase
dashboard: the three enums, the four tables (`delivery_schedules`,
`delivery_schedule_items`, `deliveries`, `delivery_items`), all CHECK
constraints, the idempotency unique index on `(schedule_id, delivery_date)`,
supporting indexes, and the RLS policies (shared org queue + owner-only schedule
soft-delete).

Before running, confirm the JWT claim path (`user_metadata.organization` /
`sub` / `is_owner`) against the live `customers`/`products` policies and adjust
the policy expressions in the migration if they differ.

## Acceptance criteria

- [ ] All three enums and four tables exist in Supabase with the documented
      columns and types.
- [ ] The customer-XOR-guest, recurrence-shape, weekday-range, and
      failure-remarks CHECK constraints are present and reject invalid rows.
- [ ] The unique index on `(schedule_id, delivery_date)` (active rows) exists.
- [ ] RLS is enabled on all four tables; the JWT claim path matches the live
      customers/products policies.
- [ ] Manual checks in `004-deliveries-schema.md` §7 pass for cross-org
      isolation and owner-only schedule archive.

## Blocked by

None — can start immediately.
