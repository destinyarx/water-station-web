# Architecture Improvement — Deepen the Modal-Mutation Choreography

> **Status:** Proposed (not yet implemented)
> **Scope:** `src/features/customers` (hooks + dialog tier)
> **Source:** Architecture review, 2026-06-12
> **Audience:** the next agent who implements this refactor

This document captures the **recommended architecture improvement** for the
customers feature so a fresh agent can implement it without re-deriving the
analysis. Vocabulary follows the architecture glossary: **module** (interface +
implementation), **seam** (where an interface lives), **deep** (small interface
over real behaviour), **shallow** (interface ≈ implementation), **locality**
(change concentrated in one place), **leverage** (one interface, N call sites).

---

## TL;DR

Three dialogs — `create-customer-dialog.tsx`, `edit-customer-dialog.tsx`,
`archive-customer-dialog.tsx` — each hand-roll the **same modal-mutation
choreography**:

```
const [open, setOpen] = useState(false)
const mutation = useXxxCustomer()

function handleOpenChange(next) {       // reset the mutation when the modal closes
  onOpenChange?.(next) / setOpen(next)
  if (!next) mutation.reset()
}

function handleSubmit(vars) {           // run the mutation, close on success
  mutation.mutate(vars, { onSuccess: () => handleOpenChange(false) })
}
```

Extract this into one **deep** hook, `useMutationDialog`, so the dialogs supply
only their content. The choreography lives in one place (locality); it is tested
once through one interface; a fourth action dialog (e.g. "restore customer")
becomes ~10 lines.

---

## The friction (before)

### Files involved
- `src/features/customers/components/create-customer-dialog.tsx`
- `src/features/customers/components/edit-customer-dialog.tsx`
- `src/features/customers/components/archive-customer-dialog.tsx`
- (supporting, unchanged) `src/features/customers/components/customer-form-dialog.tsx`

### What is duplicated
Each dialog independently owns:

1. **Open state** — `useState(open)` (create) or lifted `open`/`onOpenChange`
   props (edit, archive).
2. **Reset-on-close** — `if (!next) mutation.reset()` so a prior error does not
   re-appear the next time the modal opens.
3. **Mutate-then-close** — `mutation.mutate(vars, { onSuccess: () => close() })`.
4. **Error surfacing** — `mutation.isError ? mutation.error.message : undefined`.

These four facts are the *same rule* re-stated three times. When the rule drifts
(e.g. someone forgets `reset()` in a new dialog), the bug is invisible until a
stale error shows up in the UI.

### Why this is shallow
The dialogs' interface (open, submit, pending, error) is nearly as large as
their implementation, and the implementation is mostly wiring. **Deletion test:**
delete the choreography from one dialog and it reappears verbatim in the next —
it is not hiding complexity, it is copying it. Three real call sites (create,
edit, archive) mean the seam is **real**, not hypothetical.

---

## The deepening (after)

### New module: `useMutationDialog`
Suggested location: `src/features/customers/hooks/use-mutation-dialog.ts`
(or `src/lib/hooks/use-mutation-dialog.ts` if it will be reused by future
features — see "Generalization" below).

**Interface (everything a caller must know):**

```ts
interface MutationDialogController<TVariables> {
  open: boolean
  onOpenChange: (next: boolean) => void   // resets the mutation on close
  submit: (variables: TVariables) => void // mutates, closes on success
  isPending: boolean
  errorMessage?: string
}

// Controlled (edit / archive — parent owns `open`):
function useMutationDialog<TData, TVariables>(
  mutation: UseMutationResult<TData, Error, TVariables>,
  options: { open: boolean; onOpenChange: (next: boolean) => void },
): MutationDialogController<TVariables>

// Uncontrolled (create — hook owns `open`):
function useMutationDialog<TData, TVariables>(
  mutation: UseMutationResult<TData, Error, TVariables>,
): MutationDialogController<TVariables>
```

**Implementation responsibilities (hidden behind the interface):**
- own/forward `open`,
- call `mutation.reset()` whenever the dialog closes,
- run `mutation.mutate(vars, { onSuccess: close })`,
- derive `errorMessage` from `mutation.isError`/`mutation.error`.

**The three dialogs collapse to content only:** title, description, the form or
confirmation body, and `controller.submit`. No `useState`, no `reset()`, no
`onSuccess` plumbing.

---

## Implementation plan (TDD — follow `userSettings:tdd`)

Work in **vertical slices**: one test → one implementation → repeat. Do **not**
write all tests first.

1. **RED→GREEN:** uncontrolled `useMutationDialog` toggles `open` and calls
   `mutation.reset()` on close. (Backs `CreateCustomerDialog`.)
2. **RED→GREEN:** `submit` calls `mutation.mutate` and closes on success only.
3. **RED→GREEN:** controlled overload forwards `open`/`onOpenChange` from the
   parent and still resets on close. (Backs `EditCustomerDialog`,
   `ArchiveCustomerDialog`.)
4. **RED→GREEN:** `errorMessage` is `undefined` until `isError`, then the
   mutation's message.
5. **Refactor:** rewrite the three dialogs to consume the controller. Keep the
   existing `CustomerFormDialog` shell; it already takes the right props, so it
   only needs the controller's values passed through.

### Testing notes
- The repo's vitest setup is **node-only** (no DOM testing library, no component
  render tests) — see `docs/TESTING.md` and existing
  `src/features/customers/tests/*`. Test the **hook's behaviour** by driving a
  fake/mocked `UseMutationResult` (a `mutate` spy + flags), not by rendering a
  modal. This keeps the interface as the test surface.
- Mock only the mutation object you pass in; do **not** mock TanStack Query
  internals.

### Definition of done
- New tests pass; full suite stays green (`npx vitest run`).
- `create`/`edit`/`archive` dialogs no longer contain `useState(open)`,
  `mutation.reset()`, or inline `onSuccess` close logic.
- `npx eslint`, `npx tsc --noEmit`, `npx next build` all clean.
- No `any`, no `@ts-ignore`, no unsafe casts (per `AGENTS.md`).

---

## Secondary opportunities (lower priority — context only)

These came out of the same review. Record here so they are not re-discovered;
implement only if/when they pay off.

### B · One authenticated-session seam (`Worth exploring`)
Every hook re-derives the Supabase client via `useClerkSupabase()`, and only the
**create** path null-checks the owner (`useCustomerOwner()`); `update`/`archive`
lean entirely on RLS. Consider a single `useCustomerSession()` returning
`{ client, owner }`, and promote the generic `createClerkSupabaseClient` usage
into a shared `src/lib/hooks/use-clerk-supabase.ts` so future features (products,
expenses) reuse it.
- **Consistent with `docs/adr/0001-onboarding-gating-via-clerk-claims.md`** — it
  concentrates the claim read, it does not re-open the gating decision.
- Keep the customer-specific `water-station` template
  (`CLERK_SUPABASE_TEMPLATE`) at the feature seam, not in `lib`.

### C · Collapse the three mutation hooks (`Speculative`)
`useCreateCustomer` / `useUpdateCustomer` / `useArchiveCustomer` are near-identical
TanStack wrappers differing only in service call + which keys they invalidate. A
factory would remove duplication but trades away the idiomatic, AI-navigable
named hooks. **Likely subsumed by A** (A removes most of the per-call-site
weight). Only pursue if the number of customer mutations grows substantially.

---

## Why A first

- Three real adapters already exist → the seam is justified today.
- The duplicated open/reset/close rule is exactly the kind of choreography that
  silently drifts out of sync.
- The deepened interface becomes a **single test surface** for modal-mutation
  behaviour across the feature.

---

## Suggested skills for the implementing agent
- `superpowers:using-superpowers` — invoke first; check for applicable skills.
- `tdd` (`userSettings:tdd`) — **required**; this refactor is behaviour-preserving
  and must be done in vertical RED→GREEN slices.
- `improve-codebase-architecture` — only if re-evaluating the seam placement
  (controlled vs. uncontrolled, feature-local vs. `lib`).

## Required reading before coding (per `AGENTS.md`)
`docs/CONSTITUTIONS.md`, `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`,
`docs/SECURITY.md`, `docs/DESIGN.md` (dialog visuals), `docs/TESTING.md`, and the
companion blueprint
[`customer-feature-structure.md`](./customer-feature-structure.md).
