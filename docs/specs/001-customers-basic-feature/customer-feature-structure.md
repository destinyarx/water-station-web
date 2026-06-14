# Customer Feature Structure — Reference Blueprint for CRUD Modules

> **Purpose:** Document how the **customers** feature is built so the next agent
> can replicate the same structure when implementing other CRUD modules
> (**products**, **expenses**, orders, deliveries…). This is a *pattern
> reference*, not a spec. Copy the shape; change the domain.
>
> **Authoritative rules still live in** `AGENTS.md`, `docs/ARCHITECTURE.md`,
> `docs/CODING_STANDARDS.md`, `docs/SECURITY.md`, `docs/TESTING.md`,
> `docs/DATABASE.md`. This file shows how the customers feature *applies* them.

---

## 1. Folder layout

A CRUD feature lives entirely under `src/features/<feature>/`. Customers:

```
src/features/customers/
  components/
    customers-page.tsx          # route-level orchestration: query → loading/error/empty → table + create
    customers-table.tsx         # presentational list; renders one CustomerRowActions per row
    customer-form.tsx           # presentational RHF + Zod form (no Supabase calls)
    customer-form-dialog.tsx    # modal shell around the form (stateless about persistence)
    create-customer-dialog.tsx  # "Add" button + owns useCreateCustomer
    edit-customer-dialog.tsx    # owns useUpdateCustomer, seeded via toFormValues
    archive-customer-dialog.tsx # confirm modal, owns useArchiveCustomer (destructive button)
    customer-row-actions.tsx    # per-row Edit + Archive buttons, local dialog open state
  hooks/
    use-clerk-supabase.ts       # memoized Clerk-authenticated Supabase client
    use-customer-owner.ts       # resolves { orgId, createdBy } from Clerk session
    use-customers.ts            # list query
    use-create-customer.ts      # create mutation
    use-update-customer.ts      # update mutation
    use-archive-customer.ts     # archive (soft-delete) mutation
  services/
    customers.service.ts        # ALL Supabase queries: build → run → mask error → parse → map
  tests/                        # co-located vitest (node env): schema, mapper, service, guards
  customers.types.ts            # Row / Insert / Update / FormInput / FormValues / display model / Owner
  customers.schema.ts           # Zod: row schema (read validation) + form schema (write validation)
  customers.mapper.ts           # pure transforms: row↔display, form→insert, form→update, display→form
  customers.guards.ts           # pure domain predicates (e.g. canEditCustomer)
  customers.keys.ts             # TanStack query-key factory
  customers.constants.ts        # table name, columns, error strings, JWT template, form defaults
  index.ts                      # the feature's public surface (barrel of intended exports)
```

The route file is thin — it only renders the page component:

```
src/app/(protected)/customers/page.tsx  →  export { CustomersPage as default } or <CustomersPage />
```

> **Rule (ARCHITECTURE.md):** business logic lives in `src/features`. App Router
> is routing/layout/composition only. Never put feature logic in `page.tsx`.

---

## 2. The layers and the one-way data flow

```
UI component
   → React Hook Form + Zod (customers.schema.ts)     // validate input
   → mapper (customers.mapper.ts)                     // FormValues → snake_case payload
   → hook (hooks/use-*.ts)                             // TanStack Query, invalidation
   → service (services/customers.service.ts)          // Supabase SDK call
   → Supabase RLS                                      // authoritative tenant/owner check
   → response → Zod row schema → mapper → display model // back up to the UI
```

Each arrow is a **seam**. Tests target the pure, node-testable seams (schema,
mapper, service with a mocked client, guards) — not the React components.

---

## 3. Layer-by-layer pattern (what to copy)

### 3.1 `*.constants.ts`
Centralizes the magic strings so they are not duplicated:
- `<FEATURE>_TABLE` — Supabase table name.
- `<FEATURE>_COLUMNS` — explicit `select(...)` column list, **must match** the
  row schema. Never `select('*')`.
- User-facing error messages (`*_LOAD_ERROR`, `*_SAVE_ERROR`, …) — generic, never
  raw DB errors (SECURITY.md).
- `CLERK_SUPABASE_TEMPLATE = 'water-station'` — shared across features that use
  Clerk→Supabase RLS.
- `<FEATURE>_FORM_DEFAULTS` — empty default values for the create form
  (`as const`).

### 3.2 `*.schema.ts` (Zod — two schemas, one source of truth)
- **Row schema** (`customerRowSchema`) validates what Supabase returns *before*
  it reaches the UI, so malformed payloads fail loudly. Mirrors the Postgres
  columns (snake_case).
- **Form schema** (`customerFormSchema`) validates user input. Backs **both** the
  RHF form and the service input so client/server validation can't drift.
  - Optional text inputs: `.trim().max(n).optional()`.
  - Inputs that arrive as strings but mean numbers: use `z.preprocess(...)` to
    turn `''`→`undefined` and numeric strings → numbers, then range-check (see
    `optionalCoordinate`). This is why the form has separate input/output types.
- Export both; infer types from them (next section).

### 3.3 `*.types.ts`
Derive types from Zod, never hand-maintain parallel shapes:
```ts
export type CustomerRow = z.infer<typeof customerRowSchema>
export type CustomerFormInput  = z.input<typeof customerFormSchema>   // pre-transform (form holds these)
export type CustomerFormValues = z.output<typeof customerFormSchema>  // post-transform (service receives these)
```
Plus hand-written **payload** and **display** interfaces:
- `CustomerInsert` / `CustomerUpdate` — snake_case write payloads (Update omits
  ownership columns, adds `updated_at`).
- `Customer` — camelCase display model the UI consumes.
- `CustomerOwner { orgId: number; createdBy: string }` — tenant identity resolved
  from Clerk, applied server-side, **never** sourced from form input.

> The input/output split is critical: the form's `useForm` must be typed
> `useForm<FormInput, unknown, FormValues>` or the `zodResolver` types won't line
> up when the schema uses `z.preprocess`. See `customer-form.tsx`.

### 3.4 `*.mapper.ts` (pure functions — deeply tested)
No I/O, no React. Each transform is one named function:
- `toCustomer(row)` — DB row → display model (snake→camel; assemble denormalized
  `fullAddress` if absent).
- `toInsertRow(values, owner)` — form → insert payload; **stamps `org_id` /
  `created_by` from `owner`**, never from the form.
- `toUpdateRow(values)` — form → update payload; omits ownership (immutable),
  stamps `updated_at`.
- `toFormValues(customer)` — display → form seed for the edit dialog (nulls →
  `''` or `undefined`).
- Helpers like `emptyToNull`, `assembleFullAddress` stay private to the file.

### 3.5 `*.keys.ts` (TanStack query-key factory)
Array keys only. Hierarchical so mutations can invalidate `lists()` without
touching unrelated `detail()` queries:
```ts
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
}
```

### 3.6 `services/*.service.ts` (the only place Supabase is touched)
Every function follows the same deep shape — **build query → run → mask error →
parse → map**:
```ts
export async function createCustomer(client, values, owner): Promise<Customer> {
  const { data, error } = await client
    .from(CUSTOMERS_TABLE)
    .insert(toInsertRow(values, owner))
    .select(CUSTOMER_COLUMNS)
    .single()
  if (error) throw new Error(CUSTOMER_SAVE_ERROR)   // generic message, never raw error
  return toCustomer(customerRowSchema.parse(data))  // validate before it crosses into UI
}
```
Conventions baked in:
- Takes the `SupabaseClient` as a **parameter** (so services are testable with a
  mock and never import a singleton).
- Reads filter active rows with `.is('deleted_at', null)`; list orders by
  `created_at desc`.
- Writes scope by `.eq('id', id).is('deleted_at', null)` so archived rows can't be
  edited and the op is idempotent.
- **Archive = soft delete:** `update({ deleted_at: ... })`, **never** `.delete()`.
- Single-row reads use `.maybeSingle()` and return `null` (not throw) when absent.
- Explicit return types on every exported function.

### 3.7 `hooks/` (TanStack Query — the React seam)
- `use-clerk-supabase.ts` — `useMemo` a `createClerkSupabaseClient(() =>
  getToken({ template: CLERK_SUPABASE_TEMPLATE }))`. Shared by all queries/mutations
  so RLS sees the Clerk JWT.
- `use-<feature>-owner.ts` — reads `userId` + `sessionClaims.organization` from
  `useAuth()`; returns `{ orgId, createdBy } | null`.
- **List query** (`use-customers.ts`): `useQuery({ queryKey: keys.list(...),
  queryFn: () => getActive(client) })`.
- **Mutations** (`use-create/update/archive`): `useMutation({ mutationFn, onSuccess
  })`; on success `invalidateQueries({ queryKey: keys.lists() })` (and
  `keys.detail(id)` for updates). The create mutation guards `owner` is non-null
  before writing.

> ⚠️ See [`architecture-improvement-modal-mutation-dialog.md`](./architecture-improvement-modal-mutation-dialog.md):
> the three mutation hooks + their dialogs currently duplicate open/reset/close
> choreography. When you build the **next** module, prefer extracting a shared
> `useMutationDialog` from the start instead of copying the per-dialog wiring.

### 3.8 `*.guards.ts`
Pure domain predicates only (`canEditCustomer(c) => c.deletedAt === null`). They
encode business rules for the UI; **RLS remains the authoritative check**.

### 3.9 `components/`
- **Form** (`customer-form.tsx`): presentational. RHF + `zodResolver`. Receives
  `onSubmit`, `isPending`, `errorMessage` as props — **no Supabase calls inside**.
  Disables submit while pending; shows field + form-level errors. Uses
  shadcn/ui (`Input`, `Label`, `Button`) and follows `docs/DESIGN.md`.
- **Form dialog** (`customer-form-dialog.tsx`): stateless modal shell wrapping the
  form; create/edit pass title/description/labels in.
- **Create/Edit/Archive dialogs**: own their mutation, manage open state, reset on
  close, mutate-then-close. (← the duplication the improvement doc targets.)
- **Row actions** (`customer-row-actions.tsx`): per-row Edit/Archive buttons +
  local dialog state; uses `canEditCustomer` to disable edit on archived rows.
- **Table** (`customers-table.tsx`): presentational; renders rows + a right-aligned
  Actions column.
- **Page** (`customers-page.tsx`): calls the list hook, renders loading / error /
  **empty** states, then table + "Add" dialog. Always handle all three states.

### 3.10 `index.ts`
Barrel exporting the **intended public surface** (page, table, hooks, services,
guard, keys, schemas, mappers, types). Other features import from
`@/features/<feature>`, not deep paths.

---

## 4. Security & multi-tenancy invariants (carry into every module)

From `docs/SECURITY.md` + `docs/DATABASE.md`:
1. **Tenant/owner come from the Clerk session, never from form input.** Set
   `org_id`/`created_by` in the mapper from `CustomerOwner`. RLS independently
   rejects mismatches.
2. **RLS is the authoritative authorization** — service filters
   (`deleted_at is null`, `eq('org_id', …)` etc.) are defense-in-depth and intent,
   not the security boundary.
3. **Never surface raw DB errors** — throw the generic user-facing constant.
4. **Only `NEXT_PUBLIC_*` keys client-side.** Never expose
   `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, secrets.
5. **Soft delete, never hard delete** for user-archivable records.
6. Validate **read** responses (row schema) and **write** input (form schema).
7. Document every table + its RLS policies in `docs/DATABASE.md`.

> ⚠️ Known Phase-1 gap to resolve before this is production-real: the customers
> table migration + RLS policies (`supabase/migrations/0001_customers.sql`
> referenced by `DATABASE.md`) are **not present in the repo** — assumed applied
> externally. A new module must ship its own migration + documented policies.

---

## 5. Coding standards quick-reference (AGENTS.md)
- TypeScript strict: no `any`, no `@ts-ignore`, avoid `as`/`!`. Use `unknown` +
  narrowing. Explicit return types on exports.
- Single quotes in TS; double quotes in JSX props. kebab-case files,
  PascalCase components/types, camelCase vars.
- shadcn/ui first; Tailwind for styling; `cn()` for conditional classes.
- TanStack Query for server state; Zustand only for UI state; RHF+Zod for forms.

---

## 6. Testing pattern (docs/TESTING.md)
- Vitest, **node environment**, tests co-located in `<feature>/tests/`.
- Test the **pure & service seams**: schema validation, mappers, services (mock
  the `SupabaseClient` — a `from()` chain returning `{ data, error }`), guards.
- No component/DOM render tests in the current setup.
- Follow **TDD** (`userSettings:tdd`): vertical RED→GREEN slices, one test → one
  implementation. Never write all tests first.
- Existing examples to mirror: `customer-form.schema.test.ts`,
  `customer-insert.mapper.test.ts`, `customer-create.service.test.ts`,
  `customer-archive.service.test.ts`, `customers.guards.test.ts`.

---

## 7. Step-by-step recipe for the next CRUD module (e.g. `products`, `expenses`)

1. Write/locate the spec under `docs/specs/<nnn-feature>/` (spec → plan → tasks).
2. Add the migration + RLS policies; document them in `docs/DATABASE.md`.
3. Scaffold `src/features/<feature>/` mirroring §1.
4. `constants` → `schema` (row + form) → `types` (infer from Zod) → `mapper` →
   `keys`. (Pure layers first; TDD each.)
5. `services/<feature>.service.ts` — one function per CRUD op, the build→run→mask
   →parse→map shape; mock-client tests.
6. `hooks/` — client + owner + list query + mutations with invalidation.
7. `guards` for domain rules.
8. `components/` — page (loading/error/empty), table, form, dialogs, row actions.
   **Prefer the shared `useMutationDialog`** (see the improvement doc) over copying
   per-dialog wiring.
9. `index.ts` barrel; wire the route in `src/app/.../page.tsx`.
10. Verify: `vitest run`, `eslint`, `tsc --noEmit`, `next build` — all clean.

---

## Suggested skills for the implementing agent
- `superpowers:using-superpowers` — invoke first.
- `tdd` (`userSettings:tdd`) — required for every pure/service layer.
- `improve-codebase-architecture` — when deciding module depth/seam placement for
  the new feature.

## Companion document
- [`architecture-improvement-modal-mutation-dialog.md`](./architecture-improvement-modal-mutation-dialog.md)
  — the one open refactor; apply its `useMutationDialog` pattern in new modules.
