# Handoff — Issue 002: Create Customer

> **Blocked by Issue 001** (foundation + active list). Do not start until 001's
> schema, types, query keys, Supabase client, service layer, and RLS read policy
> exist. See `001-customer-foundation-and-active-list_handoff.md`.

## Current Feature Context

Tenant-scoped customer management (Clerk auth + Supabase RLS). This slice adds the
**create** flow on top of the read path delivered in Issue 001. Full PRD:
`docs/specs/001-customers-basic-feature/prd.md` (user stories, validation rules,
permissions, edge cases). The customers feature lives in `src/features/customers/`.

## Exact Issue to Implement

Source of truth: `docs/specs/001-customers-basic-feature/issues/002-create-customer.md`
(covers user stories 2, 3, 9, 10, 12).

A registered user opens a customer form, enters valid details, submits, and a new
customer is persisted **for their tenant only**, with creator + tenant ownership
recorded. Validate before submit; show pending and error states; on success the
active list reflects the new record without a full reload.

Acceptance criteria — see the issue file. Summary: form validates required +
optional fields; submit blocked while pending; valid insert succeeds for current
tenant; record linked to tenant + creator identity; invalid input rejected with
visible feedback; RLS prevents creating outside the tenant; list updates via
query invalidation (no full page reload).

## Files to Read First

- `docs/CONSTITUTION.md`, `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`, `docs/SECURITY.md`, root `AGENTS.md`
- `docs/specs/001-customers-basic-feature/prd.md` — **Validation Rules** section
  (name required ≤100; `is_business` defaults false; `contact_number` ≤15;
  `facebook_url` valid URL; address fields optional; lat/long range checks).
- `docs/specs/001-customers-basic-feature/REQUIREMENTS.md` lines 24–45 (`customers` schema).
- Everything produced by Issue 001 under `src/features/customers/` — especially
  `customers.schema.ts`, `customers.keys.ts`, `services/customers.service.ts`.
- Form pattern to mirror: `src/features/registration/components/complete-registration-form.tsx`
  + `hooks/use-complete-registration.ts` (RHF + zodResolver + Clerk token + mutation).
- shadcn primitives: `src/components/ui/{input,label,button,dialog}.tsx`.

## Files Likely to Modify / Create

```
src/features/customers/
  customers.schema.ts                # extend with create input schema (reuse for UI form)
  services/customers.service.ts      # add createCustomer() — Supabase insert, errors handled
  hooks/use-create-customer.ts       # useMutation; invalidate customerKeys.lists() on success
  components/customer-form.tsx        # RHF + zodResolver; submit disabled while pending
  components/customer-dialog.tsx      # optional: dialog wrapper for create
  index.ts                            # export new pieces
src/features/customers/components/customers-page.tsx  # wire up "Add customer" entry point
```

## Commands to Run

```sh
bun run test
bun run lint
bunx tsc --noEmit
bun run build
```

## Tests Required

- Schema: create input validation (required name, optional fields, URL + lat/long
  bounds, `is_business` default). Mirror `registration.schema.test.ts`.
- Service: `createCustomer` inserts and returns; throws user-friendly message on
  Supabase error; does not include client-supplied tenant/creator that bypasses RLS.
- Mutation/invalidations covered or documented (list reflects new record).
- RLS: creating outside the current tenant fails — manual or integration test
  (TASKS.md Phase 5).

## Constraints (AGENTS.md / ARCHITECTURE.md / SECURITY.md)

- **Reuse the same Zod schema** for the form and the create path (issue note).
- Keep all Supabase calls inside `services/` (issue note + ARCHITECTURE data flow).
  Keep Supabase calls **out of** the form component; pass submit logic in.
- **RHF + Zod**: `zodResolver`, infer values with `z.infer`, disable submit while
  pending, show inline validation messages.
- **TanStack**: array query keys via factory; mutation **invalidates affected
  queries** (`customerKeys.lists()`) on success.
- TS strict: no `any`/`@ts-ignore`/unsafe casts; explicit return types on exports.
- Style: single quotes TS, double quotes JSX props; kebab-case files.
- **Security**: `tenant_id` + `created_by` ownership must be set authoritatively
  (server/RLS using the Clerk identity → local tenant/user), **not** trusted from
  client input. RLS is the source of truth. No raw DB errors to users. Validate
  server-side too — client validation alone is insufficient (SECURITY.md).
- Preserve entered form values on failed create where possible (PRD edge case).

## Done Definition

- A registered user can create a valid customer scoped to their tenant; record is
  linked to tenant + creator; the active list reflects it without a full reload.
- Invalid input is rejected with visible inline feedback; submit disabled while
  pending; failures show user-friendly errors and preserve input.
- RLS blocks cross-tenant creation (verified).
- `test`, `lint`, `tsc --noEmit`, `build` pass; no `any`; no secrets exposed.
- Report: files changed, summary, assumptions, commands run, results, manual steps.

## Suggested Skills

- A TDD / test-driven skill if available (schema + service tests first).
- `superpowers:brainstorming` only if the form/dialog UX or invalidation strategy
  is unclear after reading the PRD; otherwise proceed.
