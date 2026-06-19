# Acceptance Criteria — Deliveries Module (004)

Each scenario is a manual/automated acceptance check. References map to
`REQUIREMENTS.md`.

## Prerequisite

- [ ] Migration `004-deliveries-schema.md` has been run in the Supabase
      dashboard; the four tables, enums, constraints, indexes, and RLS policies
      exist. (Blocks all testing.)

## One-time delivery

- [ ] **A-01** Creating a one-time delivery for a date ≥ today produces one
      schedule (`recurrence_type = one_time`) and exactly one `pending`
      occurrence on that date. (R-01, R-06, R-12)
- [ ] **A-02** `org_id` and `created_by` on the new rows match the signed-in
      user; they are not present as editable form fields. (R-01)

## Guest vs customer

- [ ] **A-03** A delivery linked to an existing customer stores `customer_id`,
      shows the customer's live name/address, and has empty guest fields. (R-02,
      R-05)
- [ ] **A-04** A guest delivery requires a name; submitting with neither customer
      nor guest name is rejected by both the form and the DB CHECK. (R-03, R-04)

## Recurrence

- [ ] **A-05** Weekly schedule with Mon+Thu shows "2× per week: Mon, Thu" derived
      automatically; no separate frequency number is entered. (R-07)
- [ ] **A-06** Weekly schedule with `interval_weeks = 2` on Monday materializes
      Mondays every other week from `start_date`. (R-07, R-09)
- [ ] **A-07** Monthly schedule on day 31 materializes on Feb's last day (clamp).
      (R-08, R-11)
- [ ] **A-08** A schedule with `end_date` produces no occurrence after that date.
      (R-10)

## Materialization

- [ ] **A-09** Loading `/deliveries` materializes all due occurrences within the
      next 14 days for active schedules. (R-12)
- [ ] **A-10** Reloading the view does not create duplicate occurrences for the
      same `(schedule_id, delivery_date)`. (R-13)
- [ ] **A-11** Each materialized occurrence has snapshot `delivery_items` with
      `product_name` and `unit_price` captured at generation. (R-14)
- [ ] **A-12** Pausing a schedule stops new occurrences; existing ones remain.
      (R-15)
- [ ] **A-13** Editing a schedule's recurrence/template changes only future
      occurrences; existing rows are untouched, and a dropped weekday leaves
      existing pending rows in place. (R-16)

## Lifecycle

- [ ] **A-14** `pending → for_delivery` is one click and stamps `delivered_by`
      with the acting user. (R-18)
- [ ] **A-15** `for_delivery → completed` succeeds and is terminal (no menu option
      to revert). (R-19, R-21)
- [ ] **A-16** Marking `failed` without remarks is rejected; with remarks it
      saves, and the failed status is terminal. (R-20, R-21, R-25)
- [ ] **A-17** A failed occurrence does not change its schedule's status or future
      materialization. (R-22)
- [ ] **A-18** Editing a single occurrence's items/notes/date does not affect the
      template or sibling occurrences. (R-23)

## Products & totals

- [ ] **A-19** Adding a line item defaults `unit_price` to the product's current
      price and allows override. (R-26)
- [ ] **A-20** Line totals and the delivery total are computed and displayed; no
      total column is persisted. (R-27)
- [ ] **A-21** After a product is repriced/renamed/soft-deleted, an existing
      delivery still shows the original snapshot name and price. (R-28)

## Security (RLS)

- [ ] **A-22** Org A session lists only org A schedules/occurrences; a direct
      query for an org B id returns no row. (R-29)
- [ ] **A-23** Active lists exclude soft-deleted rows. (R-30)
- [ ] **A-24** A staff user can edit and pause a schedule but cannot archive it;
      an owner can archive it. (R-31, R-33)
- [ ] **A-25** Archiving a schedule removes future pending occurrences from active
      lists while completed/failed history remains. (R-32)
- [ ] **A-26** A staff user who did not create an occurrence can still advance its
      status and edit its items. (R-33)

## Quality

- [ ] **A-27** Each view renders correct loading, error, empty, and populated
      states. (R-34)
- [ ] **A-28** A simulated Supabase error surfaces a friendly message; mutations
      disable submit while pending and refresh lists on success. (R-35, R-36,
      R-37)
- [ ] **A-29** Typecheck, lint, and tests pass; no `any`, no `@ts-ignore`, no
      exposed secrets; query keys are arrays.
