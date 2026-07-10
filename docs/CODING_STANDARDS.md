# Coding Standards

## Purpose

This file defines the implementation standards for this project.

AI coding agents must follow this document when creating, editing, reviewing, or refactoring code.

The goal is to keep the codebase:

- consistent
- readable
- type-safe
- maintainable
- easy for humans and AI agents to understand

---

## Tech Stack

This project uses:

- Next.js App Router
- TypeScript
- Clerk
- Supabase
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- shadcn/ui
- Tailwind CSS
- Vitest

Agents must not introduce additional major libraries unless the task clearly requires it or the user explicitly approves it.

---

## General Coding Principles

### Keep code simple

Prefer simple, readable code over clever abstractions.

Do not create unnecessary wrappers, helpers, hooks, or abstractions unless they reduce real duplication or improve clarity.

### Follow existing patterns

Before creating new files or structures, inspect the current project and follow its existing conventions.

If a similar feature already exists, copy the pattern and adapt it.

### Keep changes focused

Only modify files related to the requested task.

Do not refactor unrelated code.

Do not change architecture unless the task explicitly requires it.

### Prefer explicit code

Avoid magic behavior.

Use clear names, clear data flow, and clear validation.

### Do not invent requirements

Only implement what is described in the task, specification, or existing code.

If requirements are unclear, make the smallest reasonable assumption and document it in the final response.

---

## TypeScript Standards

Use TypeScript strictly.

Avoid `any`.

Use `unknown` when the type is truly unknown, then narrow it safely.

```ts
// Bad
const data: any = response.data;

// Better
const data: unknown = response.data;
```

Use explicit return types for exported functions.

Use explicit types for:

- Supabase row inputs and outputs
- form values
- table rows
- service function parameters
- mutation inputs
- important domain objects

Infer form and input types from Zod schemas when possible.

```ts
export const createCustomerSchema = z.object({
  name: z.string().min(1),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
```

Avoid unsafe assertions unless there is no practical alternative:

```ts
as SomeType
value!
```

---

## File and Folder Structure

Use feature-based organization.

Canonical feature structure:

```txt
src/features/[feature-name]/
  components/
  hooks/
  services/
    [feature-name].service.ts
  tests/
  [feature-name].schema.ts
  [feature-name].types.ts
  [feature-name].keys.ts
  [feature-name].mapper.ts
  [feature-name].guards.ts
  [feature-name].constants.ts
  index.ts
```

Do not put all feature logic inside `page.tsx`.

Do not create `*.api.ts` files for normal Supabase database queries. Use `services/[feature].service.ts`.

### `components/`

Contains UI components related to the feature.

Examples:

```txt
customer-form.tsx
customers-table.tsx
customer-columns.tsx
customer-dialog.tsx
customers-page.tsx
```

### `hooks/`

Contains React hooks for queries, mutations, and feature-specific client logic.

Examples:

```txt
use-customers.ts
use-create-customer.ts
use-update-customer.ts
use-delete-customer.ts
```

### `services/[feature].service.ts`

All normal Supabase database queries must live in feature services.

Services should:

- use the Supabase SDK, not raw `fetch`
- accept a Supabase client or use the project's existing Supabase client helper
- handle Supabase errors explicitly
- exclude soft-deleted rows from active lists when the table has `deleted_at`
- never accept `org_id` or `created_by` from form input
- return typed domain/display objects after schema validation or mapping

Example:

```ts
export async function getCustomers(
  supabase: SupabaseClient,
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, contact_number, deleted_at')
    .is('deleted_at', null);

  if (error) {
    throw new Error('Failed to load customers.');
  }

  return customerRowsSchema.parse(data).map(mapCustomerRow);
}
```

### `[feature].schema.ts`

Contains Zod schemas for:

- form validation
- service input validation
- row validation
- reusable validation rules

### `[feature].types.ts`

Contains TypeScript types related to the feature.

### `[feature].keys.ts`

Contains TanStack Query key factories.

Query keys must be arrays.

```ts
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};
```

### `[feature].mapper.ts`

Contains mapping logic between Supabase rows, validated form values, service inputs, and UI display types.

### `[feature].guards.ts`

Contains reusable permission, registration, ownership, or role checks that are safe to use in UI or services.

The database remains the source of truth through RLS.

### `[feature].constants.ts`

Contains constants, options, table config values, or reusable static values.

---

## Naming Conventions

Use kebab-case for file names.

```txt
customer-form.tsx
use-create-customer.ts
customers-table.tsx
```

Use PascalCase for React components and types.

```tsx
export function CustomerForm() {
  return <form>...</form>;
}
```

Use camelCase for variables, functions, and hooks.

```ts
const customerName = 'Juan';

export function useCustomers() {}
```

Use UPPER_SNAKE_CASE for global constants.

```ts
export const DEFAULT_PAGE_SIZE = 10;
```

For local options, camelCase is acceptable.

```ts
const statusOptions = ['active', 'inactive'];
```

---

## Next.js Standards

Use Server Components by default.

Only use `'use client'` when the component needs:

- React state
- React effects
- browser APIs
- event handlers
- React Hook Form
- TanStack Query
- TanStack Table interactive behavior

Example:

```tsx
'use client';

export function CustomerForm() {
  return <form>...</form>;
}
```

Do not mark entire pages as client components unless necessary.

Prefer keeping pages/server layouts as server components and moving interactive parts into smaller client components.

Page files should mostly:

- fetch initial data if needed
- compose components
- pass props
- define metadata if needed

Avoid putting large business logic directly inside page files.

```tsx
export default function CustomersPage() {
  return (
    <main>
      <CustomersHeader />
      <CustomersTable />
    </main>
  );
}
```

Route handlers must validate incoming request data with Zod when used.

Do not create route handlers as a substitute for normal Supabase SDK feature services unless the spec requires server-only logic.

---

## React Standards

Keep components small and focused.

A component should have one clear responsibility.

If a component becomes too large, split it into smaller components.

Define prop types clearly.

```tsx
type CustomerFormProps = {
  defaultValues?: CustomerFormValues;
  onSubmit: (values: CustomerFormValues) => void;
  isSubmitting?: boolean;
};

export function CustomerForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: CustomerFormProps) {
  // ...
}
```

Avoid passing vague props like:

```tsx
data: any;
config: any;
```

Keep state as close as possible to where it is used.

Do not create global state unless multiple unrelated parts of the app need it.

Prefer server state through TanStack Query for backend data.

---

## Styling Standards

**Use Tailwind CSS. Do not write plain CSS (inline `style` props, CSS Modules, or new
rules in `globals.css`) when Tailwind can express it.**

Reach for plain CSS only when Tailwind genuinely cannot do it:

- runtime-dynamic values computed in JS (e.g. a per-element `left`/`width`/`animationDelay`
  inside a `.map()`), which have no static class equivalent
- `@keyframes` definitions (these live in `globals.css`; reference them from Tailwind with
  `animate-[name_duration_easing_iteration]`)

When you do use an inline style for a dynamic value, keep everything else in Tailwind and
leave a short comment explaining why it can't be a class.

Reference design tokens (`--lp-*` / `--app-*`) with Tailwind v4's CSS-variable shorthand —
they follow dark mode automatically because the variables reassign under `html.dark`:

```tsx
// Good — Tailwind with the (--token) shorthand
<div className="rounded-xl border border-(--lp-border) bg-(--lp-surface) text-(--lp-text)" />

// Gradients / background images need the image: hint
<main className="bg-[image:var(--lp-hero-grad)]" />

// Composite values (shadow/ring) that embed a token keep the bracket form
<input className="focus:shadow-[0_0_0_3px_var(--lp-chip-bg)]" />

// Bad — plain inline styles for something Tailwind can express
<div style={{ borderRadius: '12px', background: 'var(--lp-surface)' }} />
```

Prefer the numeric spacing scale over arbitrary pixels (`mb-4.5`, `max-w-115`), and let the
ESLint `suggestCanonicalClasses` rule guide you to the canonical class. Use `cn()` for
conditional classes. Prefer shadcn/ui components before hand-rolling primitives.

See `docs/DESIGN.md` → Styling Approach for the design-token reference and the list of
earlier inline-styled surfaces that predate this rule.

---

## TanStack Query Standards

Use TanStack Query for server state, including:

- fetching lists
- fetching details
- creating records
- updating records
- soft-deleting records
- cache invalidation

Do not use TanStack Query for simple local UI state.

Put query hooks inside the feature `hooks` folder.

```ts
export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => getCustomers(filters),
  });
}
```

Use mutation hooks for create, update, and delete actions.

Invalidate related queries after successful mutations.

```ts
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.all,
      });
    },
  });
}
```

Do not silently ignore errors. Expose errors to the UI when useful.

Always handle loading states for async data.

---

## TanStack Table Standards

Use TanStack Table for every module's data table, not just complex ones. This keeps
pagination, sorting, and row rendering consistent across the system instead of each
feature reinventing its own table markup.

TanStack Table is required when a table needs:

- sorting
- filtering
- pagination
- column visibility
- row selection
- custom column rendering

Do not hand-roll a plain HTML/div table for a new module's list view — build it on
TanStack Table (`useReactTable` + column defs) even if pagination isn't needed on day
one, since it will almost always be needed later and retrofitting is more work than
building it in from the start.

Put large column definitions in a separate file.

```txt
src/features/customers/components/customer-columns.tsx
```

```tsx
import type { ColumnDef } from '@tanstack/react-table';

import type { Customer } from '../customers.types';

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
];
```

Keep table rendering separate from data fetching when possible.

---

## React Hook Form Standards

Use React Hook Form for forms.

Use Zod for validation.

Use `zodResolver` to connect Zod schemas to forms.

Define form schemas in:

```txt
src/features/[feature]/[feature].schema.ts
```

```ts
import { z } from 'zod';

export const customerFormSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
```

Always provide default values for forms.

```tsx
const form = useForm<CustomerFormValues>({
  resolver: zodResolver(customerFormSchema),
  defaultValues: {
    name: '',
    phone: '',
  },
});
```

Keep submit logic clear.

Do not put complex Supabase logic directly inside the form component.

Prefer passing submit logic into the form or calling mutation hooks.

```tsx
function onSubmit(values: CustomerFormValues) {
  createCustomerMutation.mutate(values);
}
```

When submitting forms:

- disable submit while pending
- show loading state
- validate using Zod
- use mutation hooks
- handle success
- handle error
- reset form only when appropriate

---

## Zod Standards

Use Zod for:

- form validation
- service input validation
- reusable validation rules
- safe parsing of unknown data

Use clear schema names.

```ts
export const createCustomerSchema = z.object({});
export const updateCustomerSchema = z.object({});
export const customerFormSchema = z.object({});
```

Infer types from schemas when possible.

```ts
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
```

Use `safeParse` when validating unknown data and you need to handle validation errors manually.

```ts
const result = createCustomerSchema.safeParse(data);

if (!result.success) {
  return {
    success: false,
    error: result.error.flatten(),
  };
}
```

---

## Error Handling Standards

Show useful but safe error messages to users.

Good:

```txt
Failed to save customer. Please try again.
```

Bad:

```txt
Postgres foreign key violation on table customers...
```

Use clear developer errors in code.

```ts
throw new Error('Customer ID is required to update customer.');
```

Do not leak tokens, private IDs, RLS policy internals, or secrets in user-facing errors.

---

## Loading and Empty States

Every data-driven UI should handle:

- loading state
- error state
- empty state
- success/data state

```tsx
if (query.isLoading) {
  return <p>Loading...</p>;
}

if (query.isError) {
  return <p>Something went wrong.</p>;
}

if (!query.data?.length) {
  return <p>No customers found.</p>;
}

return <CustomersList customers={query.data} />;
```

---

## Import Standards

Use organized imports.

Preferred order:

```ts
// React / Next
import Link from 'next/link';

// Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Internal imports
import { CustomerForm } from '@/features/customers/components/customer-form';
import type { Customer } from '@/features/customers/customers.types';
```

Use type-only imports when importing types.

```ts
import type { Customer } from './customers.types';
```

---

## Component Export Standards

Prefer named exports.

```tsx
export function CustomerForm() {}
```

Avoid default exports for reusable components unless the framework requires it.

Next.js page files may use default exports because Next.js requires them.

---

## Comments

Write comments only when they add value.

Good comments explain why something exists.

```ts
// Keep previous filters when refreshing after mutation.
queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
```

Bad comments repeat what the code already says.

```ts
// Create customer
createCustomer(input);
```

---

## AI Agent Rules

AI agents must follow these rules:

1. Read this file before coding.
2. Follow the existing project structure.
3. Do not introduce new libraries without approval.
4. Do not use `any` unless absolutely unavoidable.
5. Do not refactor unrelated files.
6. Do not rename files or folders unless required.
7. Do not change public APIs unless required.
8. Do not remove validation.
9. Do not skip error handling.
10. Do not skip loading, empty, and error states.
11. Do not place Supabase calls directly in deeply nested UI components.
12. Use Zod for validation.
13. Use React Hook Form for forms.
14. Use TanStack Query for server state.
15. Use TanStack Table for complex tables.
16. Keep components small and focused.
17. Prefer readable code over clever code.
18. Explain assumptions in the final response.

---

## Recommended Feature Pattern

When building a new feature, use this flow:

1. Define or update the feature spec under `docs/specs`.
2. Define the Zod schema.
3. Infer TypeScript types from the schema.
4. Create or update mappers.
5. Create or update Supabase service functions.
6. Create or update TanStack Query keys.
7. Create or update TanStack Query hooks.
8. Create form components using React Hook Form.
9. Create table columns if needed.
10. Create page-level composition.
11. Add loading, error, and empty states.
12. Add focused tests for schema, mapper, service, keys, guards, and critical UI flows.

---

## Final Rule

When in doubt, choose the option that makes the code easier for a human developer to read, maintain, and safely modify.
