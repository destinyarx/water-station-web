# Database

This file documents tables and their Row Level Security (RLS) policies, as
required by `docs/SECURITY.md` ("Every policy must be documented in
`docs/DATABASE.md`").

## `public.customers`

Customer profiles, scoped to an organization. Soft-deleted via `deleted_at`.

Source migration: `water-station-supabase/supabase/migrations/20260609160137_create_customers_table.sql`.

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
| is_active       | boolean        | default `true`; `false` = inactive (on file, not served) |
| org_id          | uuid (fk)      | → `organizations(id)`; tenant scope                 |
| created_by      | varchar(255) fk| → `users(clerk_id)`; the Clerk user id (`sub`)     |
| created_at      | timestamp      | default `now()`                                    |
| updated_at      | timestamp      | nullable                                           |
| deleted_at      | timestamp      | nullable; non-null = archived                      |

> **`is_active` vs `deleted_at` (feature 007):** independent states.
> `is_active = false` keeps the customer in the active list (greyed as
> *Inactive*); `deleted_at` removes them entirely. Migration:
> `docs/specs/007-remap-ui-products-customers/007-status-columns.sql`. No RLS
> change — toggling `is_active` is a normal UPDATE on a `deleted_at is null` row.
> See `docs/adr/0005-record-status-distinct-from-archive.md`.

### Identity / org resolution

RLS reads two values from the Clerk-issued JWT:

- **Organization membership**: `private.is_org_member(org_id)` resolves the Clerk subject and membership row.
- **User**: `private.current_user_id()` resolves the Clerk user id and is compared with `created_by` for creator checks.
- **Owner role**: `private.is_org_admin(org_id)` provides the organization-owner override.

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
| Members can add customers in their organization     | INSERT | `private.is_org_member(org_id)`                                                        |
| Admins/owners or creator can update customers       | UPDATE | active row and (`private.is_org_admin(org_id)` or member + `created_by = current_user`) |
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
| is_active          | boolean         | default `true`; `false` = discontinued (offered no more, kept for history) |
| org_id             | uuid (fk)       | → `organizations(id)`; tenant scope                 |
| created_by         | varchar(255) fk | -> `users(clerk_id)`; the Clerk user id (`sub`)     |
| created_at         | timestamp       | default `now()`                                    |
| updated_at         | timestamp       | nullable                                           |
| deleted_at         | timestamp       | nullable; non-null = deleted from active list      |

> **`is_active` vs `deleted_at` (feature 007):** independent states.
> `is_active = false` keeps the product in the catalog (greyed as
> *Discontinued*); `deleted_at` removes it. Migration:
> `docs/specs/007-remap-ui-products-customers/007-status-columns.sql`. No RLS
> change. See `docs/adr/0005-record-status-distinct-from-archive.md`.

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

Product update policies and trigger guards call functions stored in the
non-exposed `private` schema. The `authenticated` role therefore has `USAGE` on
that schema so PostgreSQL can resolve those database-internal functions; this
does not expose the schema through the Data API. Follow-up migration:
`supabase/migrations/20260716001701_grant_authenticated_private_schema_usage.sql`.

### Policies

| Policy                                             | Cmd    | Rule                                                                 |
| -------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| Users can view products in their organization      | SELECT | `org_id = jwt.org` and `deleted_at is null`                          |
| Users can create products in their organization    | INSERT | check `org_id = jwt.org` and `created_by = jwt.sub`                  |
| Members can update permitted products in their organization | UPDATE | using `private.is_org_member(org_id)` and `deleted_at is null`; with check `private.is_org_member(org_id)`. `private.guard_product_member_update` raises for a non-admin, non-creator changing anything except `stock` |
| Users can delete products in their organization    | UPDATE | soft delete by setting `deleted_at`; the guard raises unless `created_by = jwt.sub` or owner |

Staff users may update or soft-delete products they created. Owner users may
update or soft-delete organization-owned products even when `created_by` does
not match their Clerk user id. No user can access products from another
organization.

**Stock is the exception.** Any org member may adjust `stock` on any product in
their station; `stock` is deliberately absent from the guard's protected column
list, while `product_name`, `price`, `is_stock_tracked`, `descriptions`,
`is_active`, `org_id`, `created_by` and `deleted_at` stay owner-or-creator. The
guard **raises** rather than filtering, so a refusal reaches the client as a real
error instead of a zero-row no-op. See ADR 0015 and
`supabase/migrations/20260715053252_shared_operation_queue_rls.sql`.

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
7. Confirm `has_schema_privilege('authenticated', 'private', 'usage')` returns
   `true`; then discontinue a staff-created product as that staff user and
   confirm the update succeeds without SQLSTATE `42501`.

## `public.expenses`

Expense records are organization-scoped and soft-deleted. Source migration:
`water-station-supabase/supabase/migrations/20260609175718_create_expenses_table.sql`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | serial (pk) | integer identity |
| `name` | varchar(100) | required |
| `amount` | numeric(10,2) | required |
| `category` | `expense_category` | station cost category enum |
| `category_other` | varchar(50) | nullable custom category |
| `payment_method` | `payment_method` | payment enum |
| `payment_method_other` | varchar(50) | nullable custom method |
| `description` | varchar(255) | nullable |
| `date_incurred` | date | required |
| `references_number` | varchar(100) | nullable receipt/reference |
| `org_id` | uuid (fk) | → `organizations(id)` |
| `created_by` | varchar(255) (fk) | → `users(clerk_id)` |
| `created_at` | timestamp | default `now()` |
| `updated_at` | timestamp | server trigger-owned after migration 003 |
| `deleted_at` | timestamp | nullable soft-delete marker |

RLS: active rows are readable by organization members; members may insert in their organization; updates and legacy hard deletes require the creator or an organization admin/owner. The application uses soft delete. `get_expense_summary()` is a `SECURITY INVOKER` aggregate RPC, so the same RLS limits every total.

Manual verification: confirm an org A user cannot read, aggregate, update, or archive org B expenses; confirm staff can update their own expense; confirm an owner can update a staff-created expense; confirm archived rows disappear from lists and summaries.

## Deliveries tables (feature 004-deliveries-module)

Four tables model deliveries: `delivery_schedules` (the recurring/one-time
plan), `deliveries` (individual dated occurrences), `delivery_schedule_items`
(template product lines), and `delivery_items` (per-occurrence price/name
snapshot). Rationale and trade-offs:
`docs/adr/0002-deliveries-two-entity-rolling-materialization.md`. Feature spec:
`docs/specs/004-deliveries-module/`.

Canonical migrations live in the sibling `water-station-supabase` repository.
Keep them, `docs/specs/004-deliveries-module/004-deliveries-schema.md`, and this
section synchronized with the live tables.

### `public.delivery_schedules`

The plan for serving a customer. Linked to a `customers` row **or** a guest
label (CHECK: exactly one). Holds the recurrence rule:

- `recurrence_type` enum (`one_time` | `weekly` | `monthly`).
- `one_time`: `delivery_date`. `weekly`: `weekdays smallint[]` (ISO 1–7) +
  `interval_weeks`, anchored on `start_date`. `monthly`: `day_of_month` (clamped
  to month end) + `interval_months`, anchored on `start_date`. Optional
  `end_date`.
- `status` enum (`active` | `paused` | `ended`) controls materialization and
  main-queue visibility; it is **not** an operational delivery status.
- Standard `org_id`, `created_by`, `created_at`, `updated_at`, `deleted_at`.

### `public.deliveries`

A single dated occurrence carrying the operational lifecycle. `status` enum
(`pending` | `for_delivery` | `completed` | `failed` | `cancelled`); `failure_remarks`
is required iff `failed`, and `cancellation_remarks` is required iff
`cancelled` (CHECK). `delivered_by` is auto-stamped with the Clerk user
who moves it to `for_delivery`. Unique `(schedule_id, delivery_date)` (active
rows) makes the rolling 14-day client-triggered materialization idempotent.
Standard tenant/audit/soft-delete columns.

> **Parent-FK repair verification (2026-07-17).** The
> original migration accidentally constrained `deliveries.schedule_id` and
> `delivery_schedule_items.schedule_id` to their own tables. Canonical migration
> `20260717080000_repair_delivery_parent_relations_and_users_rls.sql` aborts on
> orphan rows and repairs both references to `delivery_schedules(id)` before the
> Dashboard V1 backfill. It now appears in remote history and read-only
> PostgREST relationship probes resolve both intended parents; authenticated SQL
> verification remains required.

### `public.delivery_schedule_items` / `public.delivery_items`

Template lines vs. per-occurrence snapshot. Snapshot rows store `product_name`
and `unit_price` captured at materialization so historical deliveries are
unaffected by later product changes. Totals are computed in app, not persisted.

> **Dashboard V1 snapshot migration (applied 2026-07-17).**
> Canonical migration `20260717090000_dashboard_v1_aggregates.sql` in the
> `water-station-supabase` repository adds a
> non-null `is_stock_tracked` snapshot to both item tables, backfills existing
> rows with the best available schedule/product value, and guards every future
> item insert path. Earlier product reclassification cannot be reconstructed
> perfectly. Follow-up migration
> `20260717100000_fix_dashboard_helper_volatility.sql` aligns private helper
> planner metadata with live lint. Linked history is synchronized, the dry run
> is empty, and linked database lint is clean; authenticated role/tenant and
> SQL metadata checks remain recorded in `docs/specs/014-dashboard-v1/MIGRATION.md`.

### `public.delivery_schedule_dates`

Custom-date schedules store one row per selected date with `schedule_id`, `delivery_date`, and organization/audit columns. Unique `(schedule_id, delivery_date)` prevents duplicate custom occurrences. RLS uses `private.is_org_member(org_id)` for SELECT, INSERT, and DELETE; it does not use `auth.uid()`.

### Atomic delivery functions

- `set_delivery_status_atomic(integer, text, text, text, text)` locks the occurrence, compare-and-sets the expected status, validates remarks/transitions, moves stock, and stamps server-owned lifecycle fields in one transaction.
- `replace_delivery_items_atomic(integer, date, text, jsonb)` locks a pending occurrence and replaces its date, notes, and item snapshots in one transaction.

Both functions are `SECURITY INVOKER`, executable only by `authenticated`, and rely on table RLS. Definitions are in handoff migration `005-atomic-delivery-writes.sql`.

Cancellation uses the same atomic status function. It permits only
`pending -> cancelled` or `for_delivery -> cancelled`, requires a trimmed
reason, restores stock when leaving `for_delivery`, and updates only the chosen
occurrence. It does not update `delivery_schedules` or future occurrences.

The Dashboard V1 migration replaces `replace_delivery_items_atomic` with the
same public signature and adds classification snapshot preservation. It does
not change delivery transition policies or status semantics.

### `public.v_current_deliveries`

Security-invoker view used by the main Deliveries table. It contains only
non-deleted `pending`/`for_delivery` occurrences whose parent schedule is
non-deleted and `active`: overdue and due-today rows, plus each schedule's
nearest upcoming row. Completed, cancelled, and failed occurrences remain in
`public.deliveries` for Delivery History and never enter this view.

Migration `20260718170000_filter_current_deliveries_by_active_schedule.sql`
adds the active-parent predicate. Stopping a recurring schedule therefore
hides all of its rows from the main queue without changing in-flight or
terminal records; resuming the schedule makes its otherwise-eligible rows
visible again. The existing Stop bulk update still archives only `pending`
occurrences dated today or later, and Resume materializes only from the resume
date forward on the original recurrence anchor.

### Dashboard V1 aggregate functions

Dashboard V1 uses two bounded JSON functions:

| Function | Access | Contents |
| --- | --- | --- |
| `get_dashboard_financials(p_period text, p_reference_date date)` | Organization owner only; database-enforced with `private.org_role` | Activity flag, delivery sales/trends, expenses/trends, daily chart buckets, sales mix, top five products |
| `get_dashboard_operations(p_period text, p_reference_date date)` | Authenticated organization members under source-table RLS | Activity flag, pending/completed delivery and refill-unit metrics, today's delivery queue, low stock, maintenance due |

Both are `STABLE`, `SECURITY INVOKER`, accept no organization/user/role
parameter, validate the four dashboard periods, and are granted to
`authenticated` only. The operational payload deliberately has no price,
revenue, sales, expense, mix, or top-product-revenue fields. Source RLS and
active-row filters remain in force. Both functions also validate the active
top-level Clerk `organization` claim and explicitly constrain every source query
to that UUID, preventing multi-membership results from combining stations.

Manual verification after application: an owner can call both functions; staff
can call operations but financials raises SQLSTATE `42501`; anon cannot execute
either; org A sees no org B values; unsupported periods fail; function metadata
shows `prosecdef = false` and volatility `stable`. Full commands/checks are in
`docs/specs/014-dashboard-v1/MIGRATION.md`.

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

> **Shared schedule lifecycle repair (2026-07-18).** Stop/Resume also remains
> available to every organization member under ADR 0015. Canonical migration
> `20260718143000_reassert_shared_delivery_schedule_rls.sql` reasserts the
> `delivery_schedules` and `deliveries` UPDATE policies after a reported Stop
> failure. The deliveries policy requires `deleted_at is null` in `USING` but
> not in `WITH CHECK`, so Stop may soft-delete future pending occurrences
> without allowing already archived rows to be edited or restored. The same
> migration adds a partial terminal-history paging index on organization,
> outcome, terminal update time, completion time, scheduled date, and id.

### Manual RLS verification

See `docs/specs/004-deliveries-module/004-deliveries-schema.md` §7 for the full
checklist (cross-org isolation, idempotent materialization, owner-only schedule
archive, failure-remarks CHECK, failed-occurrence-does-not-pause-schedule).

For the 2026-07-18 repair, additionally verify as owner and staff that Stop and
Resume work on schedules created by another member in the same organization;
Stop archives only pending occurrences dated today or later. Confirm an org A
session still cannot update an org B schedule or occurrence. After applying
`20260718170000_filter_current_deliveries_by_active_schedule.sql`, verify that a
stopped schedule contributes no rows to `v_current_deliveries`, resuming it
restores its eligible queue rows, and its completed/cancelled/failed row values
and `deleted_at` timestamps are unchanged across both actions.

## Maintenance tables (feature 008-build-maintenance-module)

Two tables model maintenance: `maintenance_schedules` (the recurring/one-time
plan) and `maintenance_tasks` (individual dated occurrences). Unlike deliveries
there is **no rolling-materialization engine** — recurring schedules keep one
`pending` occurrence that rolls forward on completion (ADR 0006). Authoritative
schema (columns, enums, constraints, indexes, policies):
`docs/specs/008-build-maintenance-module/maintenance_migration.md` — run manually
in the Supabase dashboard. Keep it and this section synchronized.

### `public.maintenance_schedules`

The plan. Enums: `priority` (`low|medium|high`), `recurrence_type`
(`one_time|everyday|weekly`). `weekdays smallint[]` (ISO 1–7) + `times_per_week`
(1–3) apply to `weekly` only, with a CHECK that `times_per_week =
array_length(weekdays,1)`. `equipment_other` is required iff `equipment =
'Others'` (CHECK). `is_active` (active/inactive) is **distinct from** `deleted_at`
(archive, owner-only). Standard `org_id`, `created_by`, audit, soft-delete.

### `public.maintenance_tasks`

A single dated occurrence carrying `status` (`pending|completed|cancelled`), `assigned_to`
(nullable FK `users(clerk_id)` — the per-occurrence assignee), `completed_at`,
`completed_by`. Unique `(schedule_id, due_date) where deleted_at is null` makes
roll-forward idempotent. Standard tenant/audit/soft-delete columns.

### Identity / org resolution

Same Clerk→Supabase contract as the other modules: `org_id` and `created_by`
written from the resolved Clerk identity, never from form input; RLS reads
`organization`, `sub`, `is_owner` from `auth.jwt()`.

### Policies (summary)

| Table | SELECT | INSERT | UPDATE | Delete |
| ----- | ------ | ------ | ------ | ------ |
| `maintenance_schedules` | org + `deleted_at is null` | org + `created_by = sub` | any org member; **soft-delete owner-only** | soft delete via UPDATE |
| `maintenance_tasks` | org + `deleted_at is null` | org + `created_by = sub` | any org member (status/assignee) | soft delete via UPDATE |

Maintenance is a **shared org queue**: any member may operate occurrences and
manage schedules regardless of `created_by`; only archiving a schedule is
owner-restricted.

> **Assignee picker prerequisite.** The form lists org staff from
> `public.users` (`clerk_id`, `name`, `org_id`). Canonical migration
> `20260717080000_repair_delivery_parent_relations_and_users_rls.sql` replaces
> only the existing users SELECT policy so it uses the documented top-level
> Clerk `organization` UUID and verifies `private.is_org_member(org_id)`.

### Manual RLS verification

See `maintenance_migration.md` → "Manual RLS verification" (cross-org isolation,
owner-only archive, shared queue, roll-forward idempotency, weekly CHECK,
assignee-picker org scope).

---

## `public.documents`

Organization permits, receipts, compliance records, and related private files. Source migration: `water-station-supabase/supabase/migrations/20260629084439_create_documents_table.sql`; storage/visibility extension: handoff migration `002-document-storage-and-visibility.sql`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint identity (pk) | document id |
| `org_id` | uuid (fk) | → `organizations(id)` |
| `created_by` | varchar(255) (fk) | Clerk uploader id |
| `title` | varchar(200) | required |
| `description` | text | nullable |
| `category` | text + CHECK | approved document category |
| `document_type` | text | nullable subtype |
| `document_date` | date | nullable |
| `amount` | numeric(12,2) | nullable |
| `expiry_date` | date | nullable; indexed for reminders |
| `visibility` | text + CHECK | `all` or `only_me` |
| `is_approved` | boolean | default false; owner-reviewed state |
| `original_name` | text | uploaded file name |
| `file_path` | text | private Storage object path |
| `created_at` | timestamp | default `now()` |
| `updated_at` | timestamp | server trigger-owned |
| `deleted_at` | timestamp | nullable soft-delete marker |

RLS: organization members may insert; active shared documents are visible to members; private documents are visible only to their creator and organization admins/owners; update/delete requires creator or admin/owner. The private `documents` Storage bucket accepts PDF, PNG, JPEG, and WEBP up to 10 MiB. Object access is linked back to a visible document row and organization-prefixed path. The application Delete flow verifies metadata update permission, removes the linked Storage object, clears `file_path`, and soft-deletes the metadata row.

Manual verification: test shared/private reads as creator, other staff, owner, and another organization; confirm invalid MIME/oversized uploads fail; confirm signed URLs expire; confirm Delete removes the object and clears `file_path`; confirm staff can delete their own document, owners can delete same-organization documents, and cross-organization deletes fail.

## `public.notifications` (feature 013-realtime-notifications-features)

Personal, per-user real-time notifications. Written **only** by `SECURITY DEFINER`
triggers (one per source event); the client consumes and marks read. No
`deleted_at` (no dismissal in v1). Migration:
`docs/specs/013-realtime-notifications-features/013-notifications.sql`. Rationale:
`docs/adr/0010-notifications-trigger-authored-consume-only.md`.

| Column       | Type            | Notes                                                        |
| ------------ | --------------- | ------------------------------------------------------------ |
| id           | serial (pk)     | integer, auto-increment                                      |
| recipient_id | varchar(255) fk | → `users(clerk_id)`; the user who sees it                    |
| title        | text            | required                                                     |
| message      | text            | required                                                     |
| type         | varchar(25)     | default `'info'`; free-form **category** (e.g. `maintenance`), not an enum, not a severity |
| is_read      | boolean         | default `false`; the only client-writable column            |
| created_at   | timestamp       | default `now()`                                              |
| org_id       | uuid (fk)       | → `organizations(id)`; tenant scope                          |
| created_by   | varchar(255) fk | → `users(clerk_id)`; the **human actor** whose action fired the trigger |

### Identity / org resolution

`org_id` is the `organizations.id` uuid (ADR 0009); RLS checks membership via
`private.is_org_member(org_id)` and identifies the recipient with
`auth.jwt() ->> 'sub'`. Inserts are performed by triggers, not the client, so
`recipient_id`/`org_id`/`created_by` are never supplied from the browser.

### Policies

| Policy                  | Cmd    | Rule                                                                    |
| ----------------------- | ------ | ----------------------------------------------------------------------- |
| (none)                  | INSERT | **No INSERT policy** — authenticated clients cannot insert; SECURITY DEFINER triggers write rows |
| `notifications_select`  | SELECT | `recipient_id = jwt.sub` **and** `private.is_org_member(org_id)`         |
| `notifications_update`  | UPDATE | `recipient_id = jwt.sub`; **column `GRANT UPDATE (is_read)`** limits the write to `is_read` only |

> **Column-locking, not a policy.** RLS `WITH CHECK` sees only the new row, so it
> cannot enforce "only `is_read` may change". The `REVOKE UPDATE ... ; GRANT
> UPDATE (is_read)` privilege is what prevents a user from rewriting
> `recipient_id`/`org_id`/`created_by`. See ADR 0010.

### Realtime

The table is in the `supabase_realtime` publication. The client subscribes to
`INSERT`/`UPDATE` (Postgres Changes) filtered `recipient_id=eq.<clerkId>`. The
SELECT policy is enforced per-connection on the stream and is the security
boundary; the filter is a bandwidth optimisation. The Clerk token reaches
Realtime via the Supabase client's `accessToken` option.

### Manual RLS verification

1. As user A, confirm the bell lists only A's notifications; a direct
   `select` of another user's or another org's notification id returns no row.
2. Attempt a client `insert` into `notifications` — rejected (no INSERT policy).
3. Attempt an `update` that sets any column other than `is_read` — rejected
   (column grant). An `is_read` update on A's own row succeeds.
4. Assign a maintenance task to user A from another session; confirm the
   notification appears live (no refresh) and marking it read persists.

## AquaFlow AI Domain (feature 011-aquaflow-ai-feature)

Two new tables back the owner-only AquaFlow AI chat. Unlike deliveries/maintenance,
these are **personal-per-user**, not a shared org queue (ADR 0007), and the whole
module is owner-only (ADR 0008).

### `ai_conversations`

One chat thread. Columns: `id`, `org_id` (FK `organizations(organization_code)`),
`created_by` (FK `users(clerk_id)`), `title` (default `'New chat'`), `created_at`,
`updated_at`. **No `deleted_at`** — conversations are hard-deleted and cascade to
their messages (`on delete cascade`).

### `ai_messages`

One turn in a conversation. Columns: `id`, `conversation_id` (FK `ai_conversations`,
`on delete cascade`), `role` (`user|assistant`), `content` (text actually sent/stored),
`display_text` (nullable — bubble override for a ready-made prompt title),
`card_type` (`insight|flag|ranked`, nullable = plain text), `card_data` (jsonb array),
`created_at`. **No denormalized `org_id`/`created_by`** — ownership is inherited from
the parent conversation.

### Identity / org resolution

`org_id`/`created_by` on `ai_conversations` are written from the resolved Clerk
identity, never from client input. Messages carry no identity columns; their RLS is
enforced by an `exists` subquery against the parent conversation.

### Policies (summary)

| Table | SELECT | INSERT | UPDATE | DELETE |
| ----- | ------ | ------ | ------ | ------ |
| `ai_conversations` | org + `created_by = sub` + `is_owner` | same | same | same (hard delete) |
| `ai_messages` | parent conversation passes the same check | same | — | same (hard delete) |

Every op on both tables requires the `is_owner` claim, so a staff session cannot
read or write rows even via a direct Supabase call.

### History context bound

No pruning or triggers. The full message history stays readable; only the context
sent to the assistant is bounded, via a fetch-time `LIMIT` (`AI_CONTEXT_MESSAGE_LIMIT`,
most-recent N, reversed to oldest-first). See `services/aquaflow-ai.service.ts:getRecentMessages`.

### Manual RLS verification

With a **staff** session: confirm the AI Assistant nav item is hidden, `/ai-assistant`
redirects to `/dashboard`, and a direct Supabase `select`/`insert` on either table
returns no rows / is rejected. With **two different owner accounts** in one org: confirm
neither can see the other's conversations. Cross-org: an org A owner cannot read org B
conversations. Migration: `docs/specs/011-aquaflow-ai-feature/011-aquaflow-ai-schema.sql`.
