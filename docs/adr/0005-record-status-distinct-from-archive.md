# Record status (active/inactive) is distinct from archive

## Context

The redesigned Customers and Products UIs (spec `007-remap-ui-products-customers`)
introduce an operational on/off state — *Active/Inactive* customers and
*Active/Discontinued* products — that the schema did not have. The only existing
"off" mechanism was `deleted_at` (archive), which removes a row from active lists
entirely via the SELECT RLS policy.

## Decision

Add `is_active boolean NOT NULL DEFAULT true` to both `public.customers` and
`public.products`, as a **separate** concept from soft-delete. An inactive /
discontinued record stays readable and listed (greyed out); only `deleted_at`
removes it from active lists. We chose a plain boolean over a `status` enum
because the design only ever shows two states; an enum would be speculative.

No RLS policy change is needed: inactive rows have `deleted_at is null` so the
existing SELECT policy already returns them, and toggling `is_active` is an
ordinary UPDATE on a non-deleted row permitted by the existing UPDATE policy.

## Consequences

- Two independent "off" states now exist per record. UI and docs must keep them
  distinct: inactive/discontinued = on file, not served / not offered; archived =
  gone from active lists. See `CONTEXT.md` → *Record Status Vocabulary*.
- Migration is delivered as SQL in the spec folder and run manually in the
  Supabase dashboard (repo has no `supabase/` folder), consistent with the
  deliveries precedent. `docs/DATABASE.md` documents the new column.
