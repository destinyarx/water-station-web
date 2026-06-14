# Architecture

## Routing

Next.js App Router is used for routing, layouts, loading states, and route-level composition.

Route files under `src/app` should stay thin. Protected pages under `src/app/(protected)` and auth pages under `src/app/(auth)` should compose feature-level components from `src/features`.

Do not put business logic directly inside `page.tsx`.

## Feature Modules

Business logic must live inside `src/features`.

Use feature-based organization for domain workflows such as customers, products, expenses, deliveries, sales, and maintenance.

## Data Flow

Normal database access should flow through feature services:

```txt
UI -> validation -> hook/action -> feature service -> Supabase SDK -> RLS -> response
```

Do not create `*.api.ts` files or raw `fetch('/api/...')` request helpers for normal Supabase database queries. Use the Supabase SDK inside feature services.

## Auth Flow

Clerk handles user authentication.

Supabase handles data authorization using RLS.

Organization-owned records must derive:

- `org_id` from the current Clerk session organization claim
- `created_by` from the authenticated Clerk user id

These values must not be user-editable form fields.

## Core Stack

Use this stack by default:

- Next.js
- TypeScript
- Supabase for database, storage, and backend services
- Supabase JavaScript SDK for querying
- TanStack Query for server state
- TanStack Table for advanced tables
- Zustand for lightweight client/UI state
- React Hook Form for forms
- Zod for validation
- shadcn/ui for components
- Tailwind CSS for styling
- Vitest for tests

Do not add new libraries unless:

- the existing project already uses them
- the spec explicitly requires them
- the user approves them

## Feature Folder Structure

Use feature-based organization.

Preferred structure:

```txt
src/
  features/
    [feature-name]/
      components/
        [feature-name]-form.tsx
        [feature-name]-table.tsx
        [feature-name]-columns.tsx
        [feature-name]-dialog.tsx
        [feature-name]-page.tsx
      hooks/
        use-[feature-name].ts
        use-create-[feature-name].ts
        use-update-[feature-name].ts
        use-delete-[feature-name].ts
      services/
        [feature-name].service.ts
      tests/
      [feature-name].types.ts
      [feature-name].schema.ts
      [feature-name].mapper.ts
      [feature-name].keys.ts
      [feature-name].guards.ts
      [feature-name].constants.ts
      index.ts
```

Do not put all feature logic inside `page.tsx`.

---
