# Handoff — Issue 003: Edit Customer

> **Blocked by Issue 001** (foundation + active list). Reuses the schema, service
> boundaries, and tenant-scoped access from 001/002. See
> `001-customer-foundation-and-active-list_handoff.md`.

## Current Feature Context

Tenant-scoped customer management (Clerk auth + Supabase RLS). This slice adds the
**edit/update** flow, reusing the same validation model and service layer as create
(Issue 002). Full PRD: `docs/specs/001-customers-basic-feature/prd.md`. Feature
code lives in `src/features/customers/`.

## Exact Issue to Implement

Source of truth: `docs/specs/001-customers-basic-feature/issues/003-edit-customer.md`
(covers user stories 4, 9, 10, 12).

A registered user opens an existing customer they own, changes details, and saves
the update back to Supabase. Reuse the create validation model; preserve pending +
error states; reject edits for customers outside the current tenant; reject editing
archived customers (no restore flow in this feature set).

Acceptance criteria — see the issue file. Summary: edit form loads an existing
current-tenant customer; validates before submit; valid update persists; update
limited to current tenant; inline validation errors prevent submission; success
reflected in list/detail; cross-tenant edit fails safely; archived customers cannot
be edited.

## Files to Read First

- `docs/CONSTITUTION.md`, `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`, `docs/SECURITY.md`, root `AGENTS.md`
- `docs/specs/001-customers-basic-feature/prd.md` — Validation Rules, Permissions,
  Edge Cases (esp. "editing an archived customer is rejected", "cross-tenant access
  must fail even if the record ID is known").
- Output of Issues 001 & 002 in `src/features/customers/`: `customers.schema.ts`,
  `customers.keys.ts`, `services/customers.service.ts`, `components/customer-form.tsx`,
  `hooks/use-create-customer.ts` (mirror for update).
- `src/features/registration/components/complete-registration-form.tsx` for the
  RHF default-values + reset pattern.

## Files Likely to Modify / Create

```
src/features/customers/
  customers.schema.ts                # add/derive update input schema (reuse create schema)
  services/customers.service.ts      # add getCustomer(id) (if not present) + updateCustomer()
  hooks/use-update-customer.ts       # useMutation; invalidate list + detail keys on success
  hooks/use-customer.ts              # optional: single-customer query for edit form load
  components/customer-form.tsx        # extend to support edit mode (default values from record)
  components/customers-columns.tsx    # add "Edit" row action
  index.ts
```

## Commands to Run

```sh
bun run test
bun run lint
bunx tsc --noEmit
bun run build
```

## Tests Required

- Schema: update input validation reuses create rules (required name, optional
  fields, URL + lat/long bounds).
- Service: `updateCustomer` persists changes and throws user-friendly error on
  failure; `getCustomer(id)` returns only current-tenant rows.
- Guard logic: archived customers (`deleted_at` not null) cannot be edited.
- RLS: editing a customer from another tenant fails safely (manual or integration
  test, TASKS.md Phase 5).

## Constraints (AGENTS.md / ARCHITECTURE.md / SECURITY.md)

- **Reuse the same customer schema and service boundaries** as create (issue note).
  Do **not** introduce a new permission model — rely on the same tenant-scoped
  rules (issue note).
- All Supabase calls in `services/`; UI → validation → service → Supabase → RLS.
- RHF + Zod: `zodResolver`, `z.infer` types, disable submit while pending, inline
  validation messages; keep Supabase calls out of the form component.
- TanStack: array query keys; mutation invalidates affected list **and** detail
  queries on success (`customerKeys.detail(id)`, `customerKeys.lists()`).
- TS strict (no `any`/`@ts-ignore`/unsafe casts); explicit return types; single
  quotes TS / double quotes JSX props; kebab-case files.
- **Security**: tenant isolation enforced by RLS (authoritative); cross-tenant edit
  must fail even with a known ID; never weaken RLS; no raw DB errors to users;
  validate server-side too. Archived edits rejected unless a future restore spec exists.

## Done Definition

- A registered user can load and update a customer they own; changes persist and
  appear in the list/detail view; pending + inline error states work.
- Cross-tenant edits and edits to archived customers fail safely.
- RLS update policy enforces tenant isolation (verified) and is documented.
- `test`, `lint`, `tsc --noEmit`, `build` pass; no `any`; no secrets exposed.
- Report: files changed, summary, assumptions, commands run, results, manual steps.

## Suggested Skills

- A TDD / test-driven skill if available (update schema + service + guard tests first).
- `superpowers:brainstorming` only if the edit-mode form reuse vs. separate
  component decision is unclear; otherwise proceed.
