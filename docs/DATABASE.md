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
| Users can delete own customers in their organization| DELETE | `org_id = jwt.org` **and** `created_by = jwt.sub`                                      |

> **Note for the active list (Issue 001):** the SELECT policy itself excludes
> archived rows (`deleted_at is null`), so archived customers are not readable
> through the normal client at all. The service layer also filters
> `deleted_at is null` to make the active-list intent explicit and independent
> of the policy.
>
> **Note for archive (Issue 004):** there is no soft-delete UPDATE policy that
> can set `deleted_at` while the row is still considered active — the UPDATE
> policy requires `deleted_at is null` in `using` but does not restrict the new
> value, so setting `deleted_at` is permitted. A hard `DELETE` policy also
> exists. Revisit archive semantics when implementing Issue 004.

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
