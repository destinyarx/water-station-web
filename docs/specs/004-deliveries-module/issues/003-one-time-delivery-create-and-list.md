# Slice 003 — One-time delivery: create + list (tracer bullet)

**Type:** AFK · **Epic:** `001-foundation.md`

## Parent

`docs/specs/004-deliveries-module/001-foundation.md`
PRD: `docs/specs/004-deliveries-module/deliveries-prd.md`

## What to build

The first end-to-end path through every layer of the Deliveries module. A user
opens `/deliveries`, creates a **one-time** delivery for either an existing
customer or a guest (name + optional contact/address), adds product line items
(unit price defaults from the product and is overridable), and sees the resulting
single delivery occurrence in the deliveries table.

Establishes the feature scaffold under `src/features/deliveries/`
(schema/types/mapper/keys/constants/service + owner/clerk-supabase hooks) mirroring
`src/features/products` and `src/features/expenses`. On create, the one-time
schedule materializes exactly one occurrence whose `delivery_items` snapshot the
`product_name` and `unit_price` at creation time. The occurrence table renders
loading, error, empty, and populated states and is org-scoped via RLS. The
create/edit dialog is the wider sectioned dialog (Customer → Schedule → Products →
Notes); only the one-time path (single date) is wired in this slice.

## Acceptance criteria

- [ ] `/deliveries` route renders the occurrence table with loading/error/empty/
      populated states.
- [ ] Creating a one-time delivery for a date ≥ today produces one schedule
      (`recurrence_type = one_time`) and exactly one `pending` occurrence on that
      date.
- [ ] A delivery can be created for an existing customer (stores `customer_id`,
      shows live name/address) OR a guest (requires `guest_name`, optional
      contact/address); submitting with neither is rejected by the form and the DB
      CHECK.
- [ ] Line items default `unit_price` to the product's current price and allow
      override; the occurrence's `delivery_items` snapshot `product_name` and
      `unit_price`.
- [ ] `org_id`/`created_by` are written from the Clerk session, never from form
      input; lists show only the caller's organization.
- [ ] Submit is disabled while pending; the list refreshes via query
      invalidation on success; Supabase errors surface a friendly message.
- [ ] Tests: schema refinements (customer-XOR-guest), mappers (row↔display,
      form→insert, totals), and a service test with a mocked Supabase client
      (identity stamping + error handling). Typecheck/lint/tests green.

## Blocked by

- `002-provision-deliveries-schema.md`
