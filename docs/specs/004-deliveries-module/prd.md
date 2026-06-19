# PRD — Deliveries Module (004)

## Summary

The Deliveries module lets a water refilling station plan, track, and complete
customer deliveries — both one-time deliveries and recurring refill schedules
(weekly, bi-weekly, monthly). It reflects real station operations: defining what
products go to whom and when, generating the day's delivery runs, and moving each
run through its status lifecycle including failure handling.

See `CONTEXT.md` → "Deliveries Domain" for canonical terms, and
`docs/adr/0002-deliveries-two-entity-rolling-materialization.md` for the
architectural decision behind the data model.

## Problem

Stations serve many customers on predictable cadences (daily/weekly office and
household refills) alongside ad-hoc one-off deliveries. Without a system, staff
track this on paper or memory, lose record of failed attempts, and cannot tie
deliveries to customers, products, and prices at the time of delivery.

## Goals

- Plan one-time and recurring deliveries with the products/services included.
- Generate concrete, actionable delivery runs for the upcoming window.
- Track each run through `pending → for_delivery → completed/failed`, capturing
  failure remarks.
- Keep delivery records tied to customers (or a guest label), products, and the
  price at delivery time.
- Enforce multi-tenant isolation and owner/staff rules via RLS.

## Non-goals (v1)

- Staff/driver assignment (`assigned_to`) — deferred until a Team/Staff module
  exists; the queue is shared within the org.
- Calendar-first or kanban UI — table-first per `docs/DESIGN.md`.
- Structured time slots — date-only; timing hints go in free-text notes.
- Stored/generated total columns and a reporting layer — totals computed in app.
- Background/cron materialization — top-up is client-triggered for v1.
- Reopening a `failed` occurrence — failed is terminal; reschedule = new run.

## Domain model

Two entities + two item tables (see ADR 0002):

- **Delivery Schedule** — the plan and recurrence rule. Linked to a Customer or a
  guest label. Has `status` (`active`/`paused`/`ended`) controlling
  materialization, not an operational delivery status.
- **Delivery** (occurrence) — a single dated run with its own status and failure
  remarks. Unique per `(schedule_id, delivery_date)`.
- **Delivery Schedule Item** — template product line on the schedule.
- **Delivery Item** — per-occurrence snapshot line capturing `product_name` and
  `unit_price` at materialization.

## Recurrence

- `one_time` — single `delivery_date`.
- `weekly` — `weekdays[]` + `interval_weeks` (1 = weekly, 2 = bi-weekly), anchored
  on `start_date`. Frequency is *derived* from the chosen weekdays — there is no
  separate "times per week" input, eliminating the mismatch risk.
- `monthly` — `day_of_month` (clamped to month end) + `interval_months`, anchored
  on `start_date`.
- Optional `end_date` stops a recurring schedule.

## Materialization

- Recurring occurrences are materialized on a **rolling 14-day horizon**.
- A **client-triggered, idempotent top-up** runs on deliveries-view load and
  inserts missing occurrences within the window. Idempotency via unique
  `(schedule_id, delivery_date)`.
- Schedule edits affect **future** materialization only; existing occurrences are
  independent and individually editable. Dropping a weekday leaves existing
  pending rows in place.
- A `failed` occurrence never stops the schedule; only `active → paused` halts
  generation.

## Roles & security

- Multi-tenant: every row scoped by `org_id`; `org_id`/`created_by` come from
  Clerk session/JWT, never form input.
- Shared org queue: any org member may read/create/update schedules and
  occurrences (status changes, remarks, item tweaks).
- **Owner-only:** soft-deleting (archiving) a Delivery Schedule.
- `delivered_by` is auto-stamped with the Clerk user who moves an occurrence to
  `for_delivery`.
- Soft delete via `deleted_at`; archived schedules cancel future *pending*
  occurrences but retain completed/failed history.

## UX

- `/deliveries` with two tabs: **Deliveries** (occurrence table, default) and
  **Schedules** (rules list).
- Occurrence table: date, customer/guest, item summary, status chip, status-aware
  row-action menu. Filters: date range (Today / Next 7 / Next 14), status,
  customer.
- Create/edit via a wider scrollable dialog, sectioned: Customer → Schedule
  (recurrence) → Products (repeatable line items, running total) → Notes.
- `failed` transition opens a dialog requiring `failure_remarks`; other
  transitions are one-click.
- Follows Ocean Vitality palette and `docs/DESIGN.md` (table-first operational
  dashboard, loading/error/empty/populated states).

## Dependencies

- Existing `customers` and `products` tables/modules.
- Clerk identity + Supabase JWT template (same contract as customers/products).
- Migration `004-deliveries-schema.md` must be run in Supabase before testing.
