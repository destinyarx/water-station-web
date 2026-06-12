# AGENTS.md

## Purpose

This file gives AI coding agents project-level instructions before they create, edit, refactor, or review code.

Agents must follow this file together with:
** te following markdown files is located at folder docs\specs **
* `CONSTITUTIONS.md`
* `ARCHITECTURE.md`
* `SECURITY.md`
* the active feature spec inside `/specs`
* the project’s existing code conventions

Do not invent product goals, app features, or business requirements unless they are explicitly written in a spec file.

---

## Agent Operating Rules

## Required Reading Before Coding

Before coding, the agent must:

1. `docs/CONSTITUTION.md`
2. `docs/ARCHITECTURE.md`
3. `docs/CODING_STANDARDS.md`
4. `docs/SECURITY.md`
5. If the code involves building frontend, refer to `docs/DESIGN.md` for design system.
6. If the task involves test using vitest, refer to `docs/TESTING.md`.
7. The relevant folder inside `specs/` but dont read it if the task is not relevant to the spec.
8. Identify unclear requirements.
9.  Ask only necessary questions.
10. Prefer editing existing patterns over creating new abstractions.
11. Avoid changing architecture unless the spec requires it.

During coding, the agent must:

* follow the existing project structure
* keep changes small and focused
* use TypeScript strictly
* avoid `any`
* avoid unnecessary abstractions
* handle loading, error, and empty states
* keep security rules intact
* update related docs if behavior changes

After coding, the agent must report:

* files changed
* summary of changes
* assumptions made
* commands run
* tests/lint/typecheck result
* remaining manual steps

---

## Required Development Approach

Use spec-driven development.

The agent must not jump directly to implementation.

Follow this workflow:

```txt
1. Constitution
2. Specification
3. Technical Plan
4. Task Breakdown
5. Implementation
6. Verification
7. Documentation Update
```

For each feature or module, create or use:

```txt
specs/[feature-or-module]/
  spec.md
  plan.md
  tasks.md
  research.md
  data-model.md
  contracts.md
  quickstart.md
```

If the user is still planning and no feature exists yet, only prepare the framework and templates.

Do not create fake features.

---

## Requirement Writing Rules

Use clear, testable requirements.

Prefer EARS-style requirements:

```txt
When [trigger], the [system] shall [response].
While [precondition], when [trigger], the [system] shall [response].
If [condition], then the [system] shall [response].
Where [feature/context], the [system] shall [response].
```

Examples:

```txt
When a user submits a valid form, the system shall validate the input using the Zod schema before sending the request.

If the Supabase request fails, the system shall show a user-friendly error message.

While a mutation is pending, the system shall disable the submit button.
```

Requirements must be:

* specific
* testable
* implementation-neutral when possible
* free from vague words like “fast,” “simple,” or “better” unless measurable

---

## TypeScript Rules

Always use TypeScript.

Never use:

```ts
any
// @ts-ignore
```

Avoid unsafe:

```ts
as SomeType
value!
```

Use `unknown` instead of `any` and narrow safely.

Exported functions should have explicit return types.

Good:

```ts
export async function getCustomers(): Promise<Customer[]> {
  // ...
}
```

Infer form and input types from Zod schemas.

Good:

```ts
export const createCustomerSchema = z.object({
  name: z.string().min(1),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
```

---

## Style Rules

Use single quotes in TypeScript and JavaScript.

```ts
const message = 'Saved successfully.';
```

Use double quotes in JSX props.

```tsx
<Button variant="outline">Cancel</Button>
```

Use kebab-case for files.

```txt
customer-form.tsx
use-create-customer.ts
customers.service.ts
```

Use PascalCase for components and types.

```tsx
export function CustomerForm() {}
```

Use camelCase for variables and functions.

```ts
const customerName = 'Juan';
```

---

## Supabase Rules

Use the Supabase SDK for normal database queries.

Do not use raw `fetch` for normal Supabase database queries.

Keep Supabase query logic inside services.

Never expose:

```txt
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
PRIVATE_API_KEYS
SECRET_WEBHOOK_KEYS
```

Allowed client variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Use the project’s existing public key convention.

Always handle Supabase errors.

Good:

```ts
const { data, error } = await supabase
  .from('customers')
  .select('id, name, created_at');

if (error) {
  throw new Error(error.message);
}
```

Do not bypass Row Level Security to make a query work.

---

## TanStack Query Rules

Use TanStack Query for server state.

Use array query keys only.

Good:

```ts
queryKey: ['customers']
```

Bad:

```ts
queryKey: 'customers'
```

Use feature-level query key factories.

```ts
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};
```

Keep query functions in services.

Keep query hooks in `hooks/`.

Use mutations for create, update, delete, upload, and server-changing actions.

Invalidate or update affected queries after successful mutations.

---

## Zustand Rules

Use Zustand only for client/UI state.

Good use cases:

* modal open/close state
* selected row IDs
* sidebar state
* local wizard state
* temporary UI preferences

Do not use Zustand for:

* Supabase query results
* data already managed by TanStack Query
* React Hook Form state
* one giant global app store

---

## React Hook Form and Zod Rules

Use React Hook Form with Zod for forms.

Form rules:

* define form validation with Zod
* infer form values with `z.infer`
* use `zodResolver`
* disable submit while pending
* show validation messages
* keep Supabase calls outside form components
* pass submit logic into the form component

---

## shadcn/ui and Tailwind Rules

Use shadcn/ui as the default component system.

Use Tailwind CSS for styling.

Rules:

* prefer shadcn components before custom primitives
* use `cn()` for conditional class names
* avoid inline styles unless necessary
* keep spacing consistent
* avoid arbitrary Tailwind values unless needed
* do not over-abstract simple UI

---

## Verification Rules

Before finishing, check:

* typecheck passes
* lint passes
* tests pass if available
* no `any`
* no ignored TypeScript errors
* no exposed secrets
* Supabase errors are handled
* RLS assumptions are documented
* query keys are arrays
* mutations invalidate affected queries
* loading/error/empty states exist
* files follow feature structure

---