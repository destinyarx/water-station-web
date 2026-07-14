# ARC-005 — Expand feature `guards.ts` with role-aware predicates (UI currently offers actions RLS will reject)

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P2 | Modules: all features (pattern), customers/products first | Effort: Medium
> Related: ISS-005 (customers edit guard) is the concrete first instance of this pattern.

## Problem

Guards today only check record state (e.g. `canEditCustomer` = `deletedAt == null`). Real owner/staff rules — "owners can edit any org product, staff only their own", "only owners archive schedules" — live **only** in RLS. The UI can therefore show a Staff user an action that fails at submit time with a generic error. RLS stays the security boundary; this is a UX/consistency layer. (`docs/ai-handoff/11-quality-and-improvements.md` Q08)

## Target design

Per feature, pure predicates in `[feature].guards.ts` taking the record plus an actor object:

```ts
export interface Actor {
  userId: string;
  isOwner: boolean;
}

export function canEditProduct(product: ProductDisplay, actor: Actor): boolean {
  if (product.deletedAt) return false;
  return actor.isOwner || product.createdBy === actor.userId;
}
```

Actor values come from the same Clerk claims the existing `use-*-owner` hooks already read — no new data source. Predicates must mirror the **live** RLS policy per table (transcribe from `docs/DATABASE.md` once ISS-001/ISS-009 reconcile it; where docs are unverified, verify the live policy first).

## Steps

1. Do customers via ISS-005 (it includes the policy verification). Treat its shape as the template.
2. Products next: encode the documented owner-override rule; wire into row-action components (disable/hide Edit/Delete per predicate).
3. Deliveries/maintenance: encode "only owners archive schedules" (per CONTEXT.md's shared-org-queue model) so staff don't see archive actions that will fail.
4. Unit-test every predicate (each role × creator × deleted combination) in each feature's `tests/` folder — these are pure functions, tests are trivial.
5. Update `docs/CODING_STANDARDS.md`'s guards guidance (if present) with a one-paragraph note: "guards mirror RLS for UX; RLS remains the boundary" — dated fable 2026-07-14.

## Acceptance criteria

- When RLS would reject an action for the current user on a record, the UI shall not present that action as enabled.
- Every new predicate shall have unit tests covering owner, creator-staff, non-creator-staff, and soft-deleted cases.
- `npm run test` / lint / typecheck pass.

## Breakage check

Guards can only hide/disable UI — they cannot cause a write failure. The risk is encoding a rule **stricter than** RLS (hiding an action a user legitimately has); prevent this by writing each predicate from the verified live policy text, not from memory or stale docs.
