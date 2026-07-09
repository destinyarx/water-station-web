# Codebase Patterns — Customers Module (Reference Blueprint)

This document reverse-engineers the `customers` feature to capture the
codebase's standard module pattern. Any new feature module (products,
deliveries, expenses, maintenance, etc.) should follow this same shape.
Read this before scaffolding a new feature.

Source analyzed:
- `src/app/(protected)/customers/page.tsx`
- `src/features/customers/**`
- Shared deps: `src/hooks/use-clerk-supabase.ts`, `src/lib/supabase/client.ts`,
  `src/components/app/*`, `src/stores/toast-store.ts`

---

## 1. Folder structure

A feature lives entirely under `src/features/<feature>/`, with the Next.js
route being a thin wrapper that just renders the feature's page component.

```
src/app/(protected)/customers/page.tsx     ← route: force-dynamic, renders <CustomersPage/>

src/features/customers/
  index.ts                    ← public API barrel (only this is imported by other layers)
  customers.types.ts          ← Row / FormValues / Insert / Update / display model types
  customers.schema.ts         ← Zod schemas (DB row validation + form validation)
  customers.constants.ts      ← table name, columns string, error messages, form defaults
  customers.keys.ts           ← TanStack Query key factory + Filters type
  customers.mapper.ts         ← row ⇄ display model ⇄ form values ⇄ insert/update payload
  customers.guards.ts         ← pure business-rule predicates (e.g. canEditCustomer)
  services/
    customers.service.ts      ← all Supabase SDK calls live here, nowhere else
    customers.service.test.ts
  hooks/
    use-customers.ts          ← useQuery (read)
    use-create-customer.ts    ← useMutation (create)
    use-update-customer.ts    ← useMutation (update)
    use-archive-customer.ts   ← useMutation (soft delete)
    use-set-customer-status.ts← useMutation (secondary field toggle)
    use-customer-owner.ts     ← resolves org_id/created_by from Clerk session
    use-mutation-dialog.ts    ← generic dialog+mutation wiring helper
  components/
    customers-page.tsx        ← page shell: header, stats, filters, table, pagination
    customers-table.tsx        ← presentational grid/table
    customer-row-actions.tsx   ← per-row kebab menu (edit / toggle / archive)
    customer-form.tsx          ← the actual RHF+Zod form (no mutation knowledge)
    customer-form-dialog.tsx   ← modal shell wrapping the form (pure presentation)
    create-customer-dialog.tsx ← owns the create mutation + confirm flow
    edit-customer-dialog.tsx   ← owns the update mutation + confirm flow
    archive-customer-dialog.tsx← owns the archive mutation + confirm flow
  tests/
    *.test.ts                 ← unit tests per schema/mapper/guard/service/hook
```

**Rule of thumb:** if it's Supabase-specific → `services/`. If it's
React-state/query wiring → `hooks/`. If it's pure data shaping with no I/O →
`*.mapper.ts` / `*.guards.ts`. If it's rendering → `components/`.

### Shared/global layer (used by every feature, not customer-specific)

```
src/hooks/use-clerk-supabase.ts   ← memoized Supabase client bound to Clerk token
src/lib/supabase/client.ts        ← createClerkSupabaseClient() factory (raw SDK setup)
src/components/app/app-modal.tsx        ← generic modal shell (title/icon/body/footer)
src/components/app/confirm-dialog.tsx   ← generic confirm modal (primary/destructive)
src/components/app/save-confirm-dialog.tsx ← confirm-before-save wrapper over ConfirmDialog
src/components/app/use-submit-confirm.ts   ← holds pending form values until confirmed
src/components/ui/*                ← shadcn primitives (Button, DropdownMenu, etc.)
src/stores/toast-store.ts          ← plain module-level pub/sub toast store (no Zustand needed here)
src/stores/*-store.ts + use-*.ts   ← Zustand stores for UI-only state (sidebar, theme)
```

New features should reuse these rather than reinventing a modal, confirm
dialog, or toast mechanism.

---

## 2. The public API barrel (`index.ts`)

Every feature exports a curated surface through `index.ts`. Other
layers (app router pages, other features) must only import from
`@/features/customers`, never reach into `services/` or `hooks/` files
directly. This keeps internals refactorable.

```ts
export { CustomersPage } from './components/customers-page'
export { useCustomers } from './hooks/use-customers'
export { getActiveCustomers, createCustomer, ... } from './services/customers.service'
export { canEditCustomer } from './customers.guards'
export { customerKeys } from './customers.keys'
export { customerRowSchema, customerFormSchema } from './customers.schema'
export { toCustomer, toInsertRow, toUpdateRow, toFormValues } from './customers.mapper'
export type { Customer, CustomerRow, CustomerFormValues, CustomerOwner } from './customers.types'
```

---

## 3. Data modeling: four shapes per entity

Every feature keeps **four distinct type shapes**, never conflated:

| Shape | Defined in | Case | Purpose |
|---|---|---|---|
| `CustomerRow` | `customers.types.ts` (`z.infer<typeof customerRowSchema>`) | snake_case | Raw row as Supabase/Postgres returns it |
| `Customer` | `customers.types.ts` | camelCase | Display model the UI actually consumes |
| `CustomerFormInput` / `CustomerFormValues` | `z.input` / `z.output` of `customerFormSchema` | camelCase | Form's raw vs. validated values (input has optional/blank strings, output is parsed) |
| `CustomerInsert` / `CustomerUpdate` | `customers.types.ts` | snake_case | Exact payload sent to Supabase `.insert()` / `.update()` |

Mapping between these lives **only** in `customers.mapper.ts`:

```
DB row ──toCustomer──▶ Customer (display)
Customer ──toFormValues──▶ CustomerFormValues (seed edit form)
CustomerFormValues + CustomerOwner ──toInsertRow──▶ CustomerInsert (write)
CustomerFormValues ──toUpdateRow──▶ CustomerUpdate (write)
```

Key conventions baked into the mapper:
- `org_id` / `created_by` are **never** taken from form input — always from
  `CustomerOwner` (resolved via Clerk in `use-customer-owner.ts`). This is a
  hard security rule from `CLAUDE.md`.
  `updated_at` is stamped client-side (`new Date().toISOString()`) on every update.
- Empty-string form fields become `null` in the DB payload (`emptyToNull`).
- Derived/denormalized display fields (like `fullAddress`) are assembled from
  parts when not already stored.

---

## 4. Validation (`customers.schema.ts`)

Two Zod schemas, two different jobs, **kept in the same file** so they can't
drift:

1. `customerRowSchema` — validates data *coming back* from Supabase. If a
   column is malformed, `.parse()` throws instead of letting bad data reach
   the UI silently.
2. `customerFormSchema` — validates the create/edit form. This is the single
   source of truth for both client-side RHF validation and the shape
   ultimately handed to the mapper/service. Custom `z.preprocess` is used for
   fields that need string→number coercion with blank-string tolerance
   (e.g. optional lat/lng from a text input).

Types are always inferred from schemas (`z.infer` / `z.input` / `z.output`),
never hand-written in parallel — this matches the root `CLAUDE.md` rule.

---

## 5. Constants (`customers.constants.ts`)

Centralizes anything that would otherwise be a magic string repeated across
service/hook/component files:
- `CUSTOMERS_TABLE` — table name
- `CUSTOMER_COLUMNS` — the exact `select()` column list, matching the row schema
- `*_ERROR` messages — user-facing copy for failed load/save/archive/status calls
- `CUSTOMER_FORM_DEFAULTS` — RHF default values for a blank create form

---

## 6. Query keys (`customers.keys.ts`)

A key factory, always arrays, always nested so invalidation can be scoped:

```ts
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
}
```

Mutations invalidate by the narrowest key that covers what changed
(`lists()` after create/archive; `lists()` + `detail(id)` after update).

---

## 7. Service layer (`services/customers.service.ts`)

**This is the only place the Supabase SDK is called.** Every exported
function:

1. Takes an already-authenticated `SupabaseClient` as its first argument
   (never creates its own client — that's the hook's job).
2. Runs one Supabase call, destructuring `{ data, error }`.
3. On `error`, throws a generic, user-safe `Error` from `customers.constants.ts`
   — **raw Postgres/Supabase error text never reaches the UI.**
4. On success, parses the raw `data` through the Zod row schema, then maps it
   to the display model via `customers.mapper.ts` before returning.
5. Relies on **RLS as the actual security boundary** — comments explicitly
   note that filters like `.is('deleted_at', null)` are for UX/idempotency,
   not tenant isolation; tenant isolation is RLS's job.

Example shape (read path):

```ts
export async function getActiveCustomers(client: SupabaseClient): Promise<Customer[]> {
  const { data, error } = await client
    .from(CUSTOMERS_TABLE)
    .select(CUSTOMER_COLUMNS)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(CUSTOMERS_LOAD_ERROR)
  return customerRowsSchema.parse(data ?? []).map(toCustomer)
}
```

Soft delete is implemented as an `update({ deleted_at: now })`, not a real
delete — matching the `deleted_at` convention from the root `CLAUDE.md`.

---

## 8. Hooks layer — TanStack Query wiring

Hooks are the **only** place that:
- instantiate the Supabase client (`useClerkSupabase()`),
- call `useQuery` / `useMutation`,
- know about query keys and cache invalidation,
- fire toasts.

### Read hook pattern (`use-customers.ts`)

```ts
export function useCustomers(): UseQueryResult<Customer[], Error> {
  const client = useClerkSupabase()
  return useQuery<Customer[], Error>({
    queryKey: customerKeys.list({ archived: false }),
    queryFn: () => getActiveCustomers(client),
  })
}
```

### Mutation hook pattern (`use-create-customer.ts`, `use-update-customer.ts`, `use-archive-customer.ts`)

Every mutation hook follows the same skeleton:

```ts
export function useXxx(): UseMutationResult<TResult, Error, TVariables> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<TResult, Error, TVariables>({
    mutationFn: (variables) => xxxService(client, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      toast.success('...')
    },
    onError: (error) => toast.error(error.message),
  })
}
```

- Create needs the tenant/creator context, resolved by a small dedicated
  hook `use-customer-owner.ts` (reads Clerk `useAuth()` claims). If context
  is missing, the mutation throws before ever calling the service —
  the UI never sends a spoofable `org_id`.
- Toasts are fired from **inside the hook**, not the component — components
  never call `toast.*` directly for mutation outcomes.

### Dialog/mutation glue (`use-mutation-dialog.ts`)

A small reusable adapter that couples a dialog's open/close state to a
mutation's lifecycle:

- Closing the dialog resets the mutation (`mutation.reset()`), so stale
  error state doesn't leak into the next open.
- `submit()` calls `mutation.mutate()` and auto-closes the dialog on success.
- Every feature dialog (create/edit/archive) builds its controller via
  `useMutationDialog(mutation, { open, onOpenChange })` instead of hand-rolling
  this logic per dialog.

---

## 9. Confirmation flow — two-step save

The codebase enforces "review before write" for create/update via a shared
pattern (per the recent "add confirmation for every action" work):

```
Form (customer-form.tsx)
   │ handleSubmit → onSubmit(values)
   ▼
create-customer-dialog.tsx
   │ onSubmit = confirm.request   (useSubmitConfirm holds values, opens confirm modal)
   ▼
SaveConfirmDialog (shared, src/components/app)
   │ onConfirm → runMutation()
   ▼
mutation.mutate(values) → service → Supabase
```

- `useSubmitConfirm<T>()` (`src/components/app/use-submit-confirm.ts`) is a
  tiny generic hook: it just stashes the pending form values and exposes
  `isOpen` — **not feature-specific**, reused by every module needing this flow.
- Destructive actions (archive, deactivate) skip the extra "review values"
  step and go straight to a `ConfirmDialog` (`archive-customer-dialog.tsx`),
  since there's nothing to review — just a yes/no.
- Reactivating (a benign, reversible toggle) skips confirmation entirely;
  deactivating (hides from active ops) requires it. This asymmetry is a
  deliberate UX call encoded directly in `customer-row-actions.tsx`.

---

## 10. Components layer — composition and state ownership

### Where state lives

| State | Owner | Why |
|---|---|---|
| Server data (`customers` list) | TanStack Query (`useCustomers`) inside `CustomersPage` | Server state, cached/invalidated by mutations |
| Search text, type filter, page number | `useState` in `CustomersPage` | Pure client UI state, page-scoped, doesn't need global store |
| "Create dialog open?" | `useState` in `CustomersPage` | Only that page needs to know |
| "Edit/Archive dialog open?" per row | `useState` in `CustomerRowActions` | Scoped to the row, not lifted to the page |
| Form field values | React Hook Form internal state (`useForm`) inside `CustomerForm` | Not global; form is unmounted/remounted (`key={open ? 'open' : 'closed'}`) each dialog open to reset |
| Pending confirm values | `useSubmitConfirm` inside each `*-dialog.tsx` wrapper | Lives exactly as long as the confirm step |
| Mutation status (pending/error) | Returned directly from the TanStack `useMutation` hook | Never duplicated into local state |

**Nothing customer-specific goes into Zustand.** Zustand
(`src/stores/*-store.ts`) is reserved for cross-page/global UI state
(sidebar open, theme) per the root `CLAUDE.md` rules — server data and
form/dialog state stay local to the feature/component tree.

### Component responsibility split

- `customers-page.tsx` — the only component that fetches the list. Owns
  filtering/search/pagination (derived via `useMemo`), renders loading/error/
  empty/no-results states explicitly, and mounts exactly one `CreateCustomerDialog`.
- `customers-table.tsx` — pure presentational grid, takes `customers: Customer[]`
  as a prop, renders one `<CustomerRowActions/>` per row. No data fetching, no
  mutations.
- `customer-row-actions.tsx` — owns which per-row dialog is open (`editing`,
  `archiving`, `confirmingInactive`) and the "toggle active/inactive" mutation
  directly (since it's a one-off action without a form).
- `customer-form.tsx` — pure form. Knows nothing about Supabase, mutations, or
  dialogs. Takes `onSubmit`, `isPending`, `errorMessage` as props. Reusable for
  both create and edit by accepting optional `defaultValues`.
- `customer-form-dialog.tsx` — pure modal shell around `CustomerForm`, wraps it
  in the shared `AppModal`. Still has no mutation knowledge.
- `create-customer-dialog.tsx` / `edit-customer-dialog.tsx` — the only components
  that call the mutation hooks (`useCreateCustomer`/`useUpdateCustomer`) and
  wire up the confirm flow. This is the "smart" layer; everything below it is "dumb".

This gives a clean **presentational vs. container** split repeated on every
level: Table (dumb) ← Page (smart data), Form (dumb) ← FormDialog (dumb shell)
← Create/EditDialog (smart mutation).

---

## 11. End-to-end request flow (read)

```
page.tsx (route)
  → <CustomersPage/>
     → useCustomers() [hook]
        → useClerkSupabase() → createClerkSupabaseClient(getToken)   [authenticated client]
        → getActiveCustomers(client) [service]
           → supabase.from('customers').select(...).is('deleted_at', null)
           → Postgres RLS scopes rows to caller's org_id
           → customerRowSchema.parse(data) [schema]
           → rows.map(toCustomer) [mapper]
        ← Customer[]
     ← rendered in <CustomersTable/>
```

## 12. End-to-end request flow (create, with confirm)

```
CreateCustomerDialog
  → CustomerFormDialog → CustomerForm (RHF + zodResolver(customerFormSchema))
     user submits → handleSubmit validates → onSubmit(CustomerFormValues)
  → confirm.request(values)          [useSubmitConfirm — opens SaveConfirmDialog]
  → user confirms → runMutation()
  → mutation.mutate(values)          [useCreateCustomer]
     → useCustomerOwner() resolves { orgId, createdBy } from Clerk claims
     → createCustomer(client, values, owner) [service]
        → toInsertRow(values, owner) [mapper] → snake_case payload, org_id/created_by from owner only
        → supabase.from('customers').insert(...).select(...).single()
        → RLS independently re-validates org_id/created_by against the JWT
        → customerRowSchema.parse(data) → toCustomer(row)
     ← Customer
  → onSuccess: invalidate customerKeys.lists(), toast.success(), close dialogs
```

---

## 13. Tests (`tests/` and `services/*.test.ts`)

One test file per unit of logic, colocated by concern, using Vitest:
- `customers.schema.test.ts` / `customer-form.schema.test.ts` — Zod validation edge cases
- `customers.mapper.test.ts` / `customer-insert.mapper.test.ts` / `customer-form-values.mapper.test.ts` — mapping correctness (nulls, trimming, address assembly)
- `customers.guards.test.ts` — pure predicate logic
- `customers.keys.test.ts` — key factory shape
- `customer-create.service.test.ts` / `customer-update.service.test.ts` / `customer-archive.service.test.ts` — service layer with a **hand-mocked chained Supabase client** (`from().select().is().order()` etc. each a `vi.fn()` returning the next link), asserting both the happy path and that raw errors are replaced by the friendly constant message
- `use-mutation-dialog.test.ts` — the dialog/mutation glue hook

Mocking pattern for Supabase: build a fake client where each chain method is
a `vi.fn()` returning an object with the next method, terminating in a
`Promise.resolve({ data, error })`. No real Supabase/network calls in tests.

---

## 14. Checklist for building a new feature module the same way

1. `xxx.types.ts` — Row / Insert / Update / display model, `FormInput`/`FormValues` from schema.
2. `xxx.schema.ts` — row schema + form schema (single source of truth for types + validation).
3. `xxx.constants.ts` — table name, columns string, error message constants, form defaults.
4. `xxx.mapper.ts` — `toX`, `toInsertRow`, `toUpdateRow`, `toFormValues`. Ownership fields only from a resolved owner/context object, never from form input.
5. `xxx.guards.ts` — pure predicates for business rules (editable? archivable?).
6. `xxx.keys.ts` — array-based query key factory.
7. `services/xxx.service.ts` — one function per Supabase operation; always takes `client` as first arg; always throws the friendly constant on `error`; always validates+maps the response before returning.
8. `hooks/use-xxx.ts` (query) and `hooks/use-create/update/archive-xxx.ts` (mutations) — get client via `useClerkSupabase()`, invalidate the narrowest relevant keys, fire toasts here.
9. `hooks/use-xxx-owner.ts` if the entity needs `org_id`/`created_by` on create.
10. `components/xxx-form.tsx` (dumb, RHF+Zod) → `xxx-form-dialog.tsx` (dumb shell) → `create/edit-xxx-dialog.tsx` (smart, owns mutation + confirm flow via shared `useSubmitConfirm`/`SaveConfirmDialog`).
11. `components/xxx-table.tsx` (dumb) + `xxx-row-actions.tsx` (smart per-row dialogs/toggles) + `xxx-page.tsx` (smart: fetch list, own filters/search/pagination as local `useState`, render loading/error/empty states explicitly).
12. `index.ts` barrel — export only what other layers should use.
13. `src/app/(protected)/xxx/page.tsx` — `export const dynamic = 'force-dynamic'`, just renders the feature's `XxxPage`.
14. Tests colocated per unit (schema, mapper, guards, keys, service, any nontrivial hook).
