# ARC-004 — Collapse near-identical mutation hooks into a shared factory

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P2 | Modules: all features (shared `src/hooks`) | Effort: Medium

## Problem

~6 modules × up to 5 mutation hooks each repeat the same body: `useClerkSupabase()` + `useQueryClient()` + `useMutation` + `invalidateQueries` + success/error toasts. The prior architecture review calls this "the rare case where an abstraction subtracts code." (`docs/ai-handoff/11-quality-and-improvements.md` Q09)

## Target design

One shared hook in `src/hooks/use-entity-mutation.ts`:

```ts
export function useEntityMutation<TInput, TResult>(options: {
  mutationFn: (client: SupabaseClient, input: TInput) => Promise<TResult>;
  invalidateKeys: readonly (readonly unknown[])[];
  successMessage: string;
  onSuccessExtra?: (result: TResult, input: TInput) => void;
}): UseMutationResult<TResult, Error, TInput>
```

It owns: getting the Clerk-authed client, calling the service fn, invalidating each key, success toast, error toast from the thrown error constant. Per-feature hooks become one-liners, e.g.:

```ts
export function useCreateCustomer() {
  return useEntityMutation({
    mutationFn: createCustomer,
    invalidateKeys: [customerKeys.lists()],
    successMessage: 'Customer created.',
  });
}
```

## Steps

1. Read 3–4 existing mutation hooks across features first (e.g. customers create/update/archive, one deliveries status hook) to capture every variation the factory must support — especially per-id `detail(id)` invalidation on update and any bespoke `onSuccess` side effects.
2. Implement the factory with full typing (no `any`; generics inferred from `mutationFn`). Unit-test it once with a mocked client/queryClient.
3. Migrate **one feature** (customers) as the pilot PR. Do not touch hooks that have genuinely bespoke behavior (deliveries status flow) unless they fit cleanly — forcing them in is worse than the duplication.
4. Migrate remaining features in follow-up PRs, one feature per PR, keeping public hook names and signatures identical so components don't change.

## Acceptance criteria

- Per-feature mutation hooks migrated to the factory shall keep their exported name, parameters, and observable behavior (invalidations, toasts) unchanged.
- The factory shall be unit-tested; `npm run test` / lint / typecheck pass after each PR.

## Breakage check

Behavioral parity is the whole game: before/after each migration, list the exact `invalidateQueries` keys and toast messages of every hook touched and assert they're identical. Component files should show **zero** diff.
