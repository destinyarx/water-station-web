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
