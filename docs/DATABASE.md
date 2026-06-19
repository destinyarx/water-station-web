# Database

This file documents tables and their Row Level Security (RLS) policies, as
required by `docs/SECURITY.md` ("Every policy must be documented in
`docs/DATABASE.md`").

## `public.customers`

Customer profiles, scoped to an organization. Soft-deleted via `deleted_at`.

Migration: `supabase/migrations/0001_customers.sql`

| Column          | Type           | Notes                                              |
| --------------- | -------------- | -------------------------------------------------- |
| id              | serial (pk)    | integer, auto-increment                            |
| name            | varchar(100)   | required                                           |
| is_business     | boolean        | default `false`                                    |
| contact_number  | varchar(15)    | nullable                                           |
| facebook_url    | varchar(255)   | nullable                                           |
| latitude        | numeric(10,7)  | nullable                                           |
| longitude       | numeric(10,7)  | nullable                                           |
| street_address  | varchar(70)    | nullable                                           |
| barangay        | varchar(70)    | nullable                                           |
| municipality    | varchar(70)    | nullable                                           |
| province        | varchar(70)    | nullable                                           |
| full_address    | varchar(255)   | nullable; denormalized display value               |
| org_id          | integer (fk)   | → `organizations(organization_code)`; tenant scope |
| created_by      | varchar(255) fk| → `users(clerk_id)`; the Clerk user id (`sub`)     |
| created_at      | timestamp      | default `now()`                                    |
| updated_at      | timestamp      | nullable                                           |
| deleted_at      | timestamp      | nullable; non-null = archived                      |

### Identity / org resolution

RLS reads two values from the Clerk-issued JWT:

- **Organization**: `(auth.jwt() -> 'user_metadata' ->> 'organization')::integer`
  — compared against `org_id`.
- **User**: `auth.jwt() ->> 'sub'` (the Clerk user id) — compared against
  `created_by` for write/ownership checks.

The browser Supabase client (`src/lib/supabase/client.ts`) forwards the caller's
Clerk token via the `accessToken` option, using the `water-station` JWT template
(`CLERK_SUPABASE_TEMPLATE`) so Supabase sees these claims as `auth.jwt()`. On
create, the service writes `org_id`/`created_by` from the resolved Clerk identity
(`useCustomerOwner`), never from form input; the INSERT policy independently
rejects any mismatch.

### Policies

| Policy                                              | Cmd    | Rule                                                                                   |
| --------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| Users can view customers in their organization      | SELECT | `org_id = jwt.org` **and** `deleted_at is null`                                        |
| Users can create customers in their organization    | INSERT | check `org_id = jwt.org` **and** `created_by = jwt.sub`                                |
| Users can update own customers in their organization| UPDATE | `org_id = jwt.org` **and** `created_by = jwt.sub` **and** `deleted_at is null` (+check)|
| Users can delete own customers in their organization| DELETE | Legacy hard-delete policy; must not be used by normal UI flows                         |

> **Note for the active list (Issue 001):** the SELECT policy itself excludes
> archived rows (`deleted_at is null`), so archived customers are not readable
> through the normal client at all. The service layer also filters
> `deleted_at is null` to make the active-list intent explicit and independent
> of the policy.
>
> **Soft-delete rule:** application archive/delete actions must soft-delete by
> setting `deleted_at = now()`. Hard `DELETE` policies are legacy/admin-only and
> must not be used by normal UI flows unless a future spec explicitly documents
> that behavior.

### Manual RLS verification (Issue 001)

1. Sign in as a user in org A; confirm `/customers` lists only org A's rows.
2. With org A's session, query an org B customer id directly through the
   Supabase client — it must return no row (RLS blocks cross-org reads).
3. Confirm archived rows (`deleted_at` not null) never appear in the list.

### Manual verification (Issues 002–004: create / edit / archive)

1. **Create** a customer from `/customers` → "Add customer". Confirm the new
   row appears without a page reload and that `org_id`/`created_by` match the
   signed-in user (INSERT policy).
2. With org A's session, attempt to insert a row with `org_id` = org B (e.g. via
   the Supabase client directly) — the INSERT policy must reject it.
3. **Edit** an org A customer; confirm changes persist and the list refreshes.
   Attempt to update an org B customer id directly — RLS must block it. Confirm
   an archived row (`deleted_at` not null) cannot be updated (UPDATE `using`
   requires `deleted_at is null`).
4. **Archive** an org A customer; confirm `deleted_at` is set (row still present
   in the table, not deleted) and it drops out of the active list. Attempt to
   archive an org B customer id directly — RLS must block it.

## `public.products`

Products and refill services offered by a water station, scoped to an
organization. Soft-deleted via `deleted_at`.

Table exists in Supabase. Repository feature spec:
`docs/specs/002-products/description.md`.

| Column             | Type            | Notes                                              |
| ------------------ | --------------- | -------------------------------------------------- |
| id                 | serial (pk)     | integer, auto-increment                            |
| product_name       | varchar(255)    | required display name                              |
| price              | float           | required selling price                             |
| is_stock_tracked   | boolean         | default `true`; controls whether stock is counted  |
| stock              | integer         | default `0`; meaningful only for stock-tracked products |
| descriptions       | varchar(255)    | nullable short description                         |
| org_id             | integer (fk)    | -> `organizations(organization_code)`; tenant scope |
| created_by         | varchar(255) fk | -> `users(clerk_id)`; the Clerk user id (`sub`)     |
| created_at         | timestamp       | default `now()`                                    |
| updated_at         | timestamp       | nullable                                           |
| deleted_at         | timestamp       | nullable; non-null = deleted from active list      |

### Identity / org resolution

Products use the same Clerk-to-Supabase identity contract as other
organization-owned records:

- **Organization**: the current Clerk session's `organization` claim, forwarded
  in the Supabase JWT and compared against `org_id`.
- **User**: the Clerk user id (`sub`), compared against `created_by` where the
  policy requires record ownership.
- **Owner role**: the current Clerk session's `is_owner` claim. Product feature
  code reads this as `sessionClaims.is_owner`; Supabase RLS must receive the
  same role value through the configured Clerk JWT template.

On create, the service writes `org_id`/`created_by` from the resolved Clerk
identity, never from form input. RLS independently rejects cross-organization
access and invalid ownership/role combinations.

### Policies

| Policy                                             | Cmd    | Rule                                                                 |
| -------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| Users can view products in their organization      | SELECT | `org_id = jwt.org` and `deleted_at is null`                          |
| Users can create products in their organization    | INSERT | check `org_id = jwt.org` and `created_by = jwt.sub`                  |
| Users can update products in their organization    | UPDATE | `org_id = jwt.org` and `deleted_at is null`; allowed when `created_by = jwt.sub` or owner |
| Users can delete products in their organization    | UPDATE | soft delete by setting `deleted_at`; allowed when `created_by = jwt.sub` or owner |

Staff users may update or soft-delete products they created. Owner users may
update or soft-delete organization-owned products even when `created_by` does
not match their Clerk user id. No user can access products from another
organization.

### Manual RLS verification

1. Sign in as a user in org A; confirm `/products` lists only org A's active
   products.
2. With org A's session, query an org B product id directly through the
   Supabase client; it must return no row.
3. Create a product from `/products`; confirm `org_id` and `created_by` match
   the signed-in user's organization and Clerk id.
4. As a staff user, update and soft-delete a permitted org product; confirm the
   active list refreshes and deleted rows disappear.
5. As an owner, update and soft-delete an org product created by a staff user;
   confirm owner override succeeds.
6. Attempt to update or soft-delete an org B product id directly as either
   staff or owner; RLS must block it.

## `public.expenses`

Expense records are implemented in the repository under `src/features/expenses`
and must follow the same organization-scoped identity contract as customers and
products.

Repository feature spec: `docs/specs/003-expenses/`.

Expense documentation must be kept synchronized with the actual Supabase table
and RLS policies before changing expense persistence behavior. At minimum, the
expense table documentation should include:

- all columns and types
- `org_id` tenant scope
- `created_by` Clerk user identity
- `deleted_at` soft-delete behavior, if present
- owner/staff read and mutation rules
- manual RLS verification steps for cross-organization access

## Deliveries tables (feature 004-deliveries-module)

Four tables model deliveries: `delivery_schedules` (the recurring/one-time
plan), `deliveries` (individual dated occurrences), `delivery_schedule_items`
(template product lines), and `delivery_items` (per-occurrence price/name
snapshot). Rationale and trade-offs:
`docs/adr/0002-deliveries-two-entity-rolling-materialization.md`. Feature spec:
`docs/specs/004-deliveries-module/`.

Migration to run in the Supabase dashboard (no `supabase/` folder in repo):
`docs/specs/004-deliveries-module/004-deliveries-schema.md`. That file is the
authoritative source for columns, enums, constraints, indexes, and policies;
keep it and this section synchronized with the live tables.

### `public.delivery_schedules`

The plan for serving a customer. Linked to a `customers` row **or** a guest
label (CHECK: exactly one). Holds the recurrence rule:

- `recurrence_type` enum (`one_time` | `weekly` | `monthly`).
- `one_time`: `delivery_date`. `weekly`: `weekdays smallint[]` (ISO 1–7) +
  `interval_weeks`, anchored on `start_date`. `monthly`: `day_of_month` (clamped
  to month end) + `interval_months`, anchored on `start_date`. Optional
  `end_date`.
- `status` enum (`active` | `paused` | `ended`) controls materialization only;
  it is **not** an operational delivery status.
- Standard `org_id`, `created_by`, `created_at`, `updated_at`, `deleted_at`.

### `public.deliveries`

A single dated occurrence carrying the operational lifecycle. `status` enum
(`pending` | `for_delivery` | `completed` | `failed`); `failure_remarks`
required iff `failed` (CHECK). `delivered_by` is auto-stamped with the Clerk user
who moves it to `for_delivery`. Unique `(schedule_id, delivery_date)` (active
rows) makes the rolling 14-day client-triggered materialization idempotent.
Standard tenant/audit/soft-delete columns.

### `public.delivery_schedule_items` / `public.delivery_items`

Template lines vs. per-occurrence snapshot. Snapshot rows store `product_name`
and `unit_price` captured at materialization so historical deliveries are
unaffected by later product changes. Totals are computed in app, not persisted.

### Identity / org resolution

Same Clerk→Supabase contract as customers/products: `org_id` and `created_by`
written from the resolved Clerk identity on insert, never from form input; RLS
reads `organization`, `sub`, and `is_owner` from `auth.jwt()`.

### Policies (summary)

| Table | SELECT | INSERT | UPDATE | Delete |
| ----- | ------ | ------ | ------ | ------ |
| `delivery_schedules` | org + `deleted_at is null` | org + `created_by = sub` | any org member (edit/pause); **soft-delete owner-only** (set `deleted_at` permitted only when `is_owner`) | soft delete via UPDATE |
| `deliveries` | org + `deleted_at is null` | org + `created_by = sub` | any org member (status/remarks/items) | soft delete via UPDATE |
| `delivery_schedule_items` | org | org (FOR ALL) | org | follows parent |
| `delivery_items` | org | org (FOR ALL) | org | follows parent |

Deliveries are a **shared org queue**: any organization member may operate
occurrences regardless of `created_by`. The only owner-restricted action is
archiving (soft-deleting) a Delivery Schedule.

### Manual RLS verification

See `docs/specs/004-deliveries-module/004-deliveries-schema.md` §7 for the full
checklist (cross-org isolation, idempotent materialization, owner-only schedule
archive, failure-remarks CHECK, failed-occurrence-does-not-pause-schedule).
