# Research — Deliveries Module (004)

Findings from inspecting the existing codebase that constrain or inform the
deliveries design.

## Existing conventions to mirror

- **Feature structure** (`src/features/<feature>/`): `*.schema.ts`, `*.types.ts`,
  `*.mapper.ts`, `*.keys.ts`, `*.constants.ts`, `*.guards.ts`,
  `services/<feature>.service.ts`, `hooks/`, `components/`, `index.ts`, `tests/`.
  Deliveries should follow the same layout (see `src/features/products` and
  `src/features/expenses`).
- **Row → display mapping**: snake_case `*RowSchema` validated from Supabase,
  mapped to camelCase display models via a mapper (see
  `products.types.ts`: `ProductRow`, `Product`, `ProductInsert`, `ProductUpdate`).
- **Query keys**: array-based factories (`customerKeys` pattern in
  `customers.keys.ts`).
- **Owner/identity resolution**: a `use-<feature>-owner` hook resolves
  `{ orgId, createdBy }` from Clerk claims; services write these, never form
  input (`use-product-owner.ts`, `use-customer-owner.ts`).
- **Clerk→Supabase**: `use-clerk-supabase.ts` forwards the Clerk token to
  Supabase; RLS reads `auth.jwt()` claims.
- **Forms**: RHF + Zod (`zodResolver`), submit disabled while pending, dialog +
  `*-form.tsx` / `*-form-dialog.tsx` / `create-*-dialog.tsx` / `edit-*-dialog.tsx`
  split (see expenses/customers components).
- **Tables**: `*-table.tsx` + `*-row-actions.tsx` (see `expenses-table.tsx`).

## Data type facts

- `customers.id` and `products.id` are `serial` (integer). FKs from deliveries
  use integer.
- `org_id integer` → `organizations(organization_code)`;
  `created_by varchar(255)` → `users(clerk_id)`.
- `products.price` is `float` in the live table; line-item snapshots use
  `numeric(12,2)` to store an immutable captured price (money precision).
- Existing tables use `timestamp` for audit fields. Deliveries introduces `date`
  columns for calendar dates (`delivery_date`, `start_date`, `end_date`,
  `day_of_month` derived) to avoid timezone drift (station is PH / UTC+8).

## Migration delivery method

- There is **no `supabase/` migrations folder** in the repo. `docs/DATABASE.md`
  references migration filenames (e.g. `0001_customers.sql`) that were applied by
  hand in the Supabase dashboard. Therefore the deliveries migration is delivered
  as a runnable SQL block in `004-deliveries-schema.md` for the user to execute in
  the dashboard before testing — consistent with the established workflow.

## RLS claim path caveat

- `docs/DATABASE.md` documents org claim as
  `(auth.jwt() -> 'user_metadata' ->> 'organization')::integer` and user as
  `auth.jwt() ->> 'sub'`. Products docs reference an `is_owner` claim used for
  owner override. The exact JWT path (`user_metadata` vs top-level) must be
  confirmed against the live customers/products policies and the configured Clerk
  JWT template before running the deliveries migration; the migration notes this.

## Open items deferred (not v1)

- Staff/driver assignment — pending Team/Staff module.
- Calendar UI and reporting totals.
- Background/cron materialization to replace the client-triggered top-up.
- Reopening failed occurrences.

## Key decision

Recorded in `docs/adr/0002-deliveries-two-entity-rolling-materialization.md`:
two-entity model (schedule vs occurrence), rolling 14-day materialization, dual
item tables with per-occurrence price/name snapshot.
