# CONTEXT.md

## Business Domain

This app is for a water refilling station.

The business sells two types of products:

1. Stock-based products  
   These are physical products with inventory count, such as bottled water, caps, containers, and accessories.

2. Refillable/service-based products  
   These are daily delivery or refill products that do not need normal stock deduction. They represent a refill service or recurring delivery.

## User Roles

### Owner

Can manage:
- dashboard
- customers
- staff/team
- products
- orders
- deliveries
- payments
- expenses
- revenue reports
- sales reports

### Staff

Can manage:
- assigned deliveries
- customer records if allowed
- products
- order status updates
- maintenance tasks

Staff should not access owner-only financial summaries unless explicitly allowed.

Staff can create products and update or delete product records they created.
Owners can update and delete organization-owned product records even when they
were created by another staff member in the same station.

## Core Modules

- Implemented or actively specified: Authentication, Customers, Products, Expenses
- Planned modules: Orders, Deliveries, Payments, Inventory, Reports, Settings, Team/Staff Management

Agents must not treat planned modules as approved implementation scope unless a
feature spec under `docs/specs` exists for the requested work.

## Deliveries Domain (feature 004-deliveries-module)

**Delivery Schedule** — the *plan* for serving a customer: who is served, what
products/services are included, and when (a single one-time date, or a recurring
rule such as "every Mon/Thu"). A schedule does not itself have an operational
status. One schedule produces one or more Deliveries.
_Avoid_: confusing a schedule with an individual delivery run.

**Delivery** (a.k.a. delivery occurrence) — a single dated delivery event that
staff actually prepares and carries out. It is the thing that moves through the
status lifecycle (`pending` → `for_delivery` → `completed`/`failed`) on a
specific date. A one-time schedule has exactly one Delivery; a recurring
schedule has many.
_Avoid_: "delivery" meaning the recurrence rule.

**Delivery Item** — a product line on a Delivery (or schedule template),
preserving the product, quantity, and the unit price at the time of delivery so
later product price changes do not alter past delivery records.

**Guest / named delivery** — a Delivery Schedule not linked to a Customer
record, identified only by a display label (e.g. walk-in or one-off recipient).

**Current delivery queue** — the actionable working set shown on the main
deliveries page: all `pending`/`for_delivery` occurrences that are overdue
(`delivery_date < today`) or due today, **plus** each active schedule's single
nearest upcoming occurrence. The full materialization horizon still exists in
the database but is not part of the "current" queue until each row becomes the
nearest upcoming one.
_Avoid_: equating "current queue" with "everything materialized".

**Delivery History** — the modal datatable of terminal occurrences only
(`completed` + `failed`). Not editable except to send a row back to
`pending`/`for_delivery`, which returns it to the current queue.

**Recurring schedule list** — the modal datatable of parent `delivery_schedules`
recurrence rules (not dated occurrences); its only action is stop/resume.

**Stop / Resume (a schedule)** — _Stop_ sets a recurring schedule to `paused`
and soft-deletes its pending occurrences dated today or later (in-flight
`for_delivery` rows and terminal history are kept; overdue pending is kept).
_Resume_ sets it back to `active` and materialization continues forward from the
current date on the schedule's **original `start_date` anchor** — the paused gap
is not back-filled. Distinct from archiving (owner-only soft delete of the
schedule itself), which is deferred.
_Avoid_: treating Stop as deleting history or as archiving the schedule.

**Stock-out window** — a delivery's items are deducted from `products.stock`
exactly while its status is `for_delivery` or `completed` (stock-tracked
products only). Entering that window deducts (blocked if it would go negative);
leaving it restores. See `005` ADR 0003.

## Important Product Rule

Products are classified by whether the station tracks their stock quantity.

**Stock-tracked product**:
A physical product whose available quantity is counted, such as bottled water, caps, containers, dispensers, and accessories.
_Avoid_: Inventory-tracked item

**Non-stock-tracked product**:
A refill, service, or fee product whose available quantity is not counted, such as water refill services, delivery fees, and cleaning fees.
_Avoid_: Service item, untracked inventory item

## Authentication & Onboarding (feature 000-auth_workflow)

- **Water station** — the organization an owner runs. Identified to staff by an **invite
  code** (the `organization` value in the registration payload and the Clerk
  `organization` session claim).
- **Owner** — creates/owns a station (`is_owner = true`). At registration the client sends
  `organization: null`; the edge function creates the station and assigns a **non-null**
  `organization` claim server-side.
- **Staff** — joins an existing station with its invite code
  (`is_owner = false`, `organization = inviteCode`).
- **Session claims** — custom Clerk session-token claims (`organization`, `is_owner`)
  written by the edge function. Declared in `src/types/globals.d.ts`.
- **Registration / onboarding** — required post-sign-up step at `/complete-registration`.
  Submits to the Supabase `update-clerk-session-tokens` edge function (axios POST, Bearer
  session token), which writes `is_owner` + `organization` into the session token.
- **Registered** — `sessionClaims.organization != null && sessionClaims.is_owner != null`
  (`isRegistered()` in `src/features/registration/registration.guards.ts`). Until then,
  middleware (`src/proxy.ts`) redirects every protected route to `/complete-registration`.
  See `docs/adr/0001-onboarding-gating-via-clerk-claims.md`.
- **`update-clerk-session-tokens`** — Supabase edge function
  (`NEXT_PUBLIC_SUPABASE_EDGE_REGISTRATION_URL`). Assumed deployed; the app only calls it.
  **Required guarantee:** for owners it must set a non-null `organization` claim, otherwise
  owners loop forever on `/complete-registration`.
