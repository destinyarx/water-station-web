# Architecture

## Routing
Next.js App Router is used only for routing, layouts, loading states, and route-level composition.

## Feature Modules
Business logic must live inside `src/features`.

## Data Flow
UI → form validation → feature action/service → Supabase query → RLS policy → response.

## Auth Flow
Clerk handles user authentication.
Supabase handles data authorization using RLS.

## Core Stack

Use this stack by default:

* Next.js
* TypeScript
* Supabase for database, storage, and backend services
* Supabase JavaScript SDK for querying
* TanStack Query for server state
* TanStack Table for advanced tables
* Zustand for lightweight client/UI state
* React Hook Form for forms
* Zod for validation
* shadcn/ui for components
* Tailwind CSS for styling

Do not add new libraries unless:

* the existing project already uses them
* the spec explicitly requires them
* or the user approves them


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
      [feature-name].types.ts
      [feature-name].schema.ts
      [feature-name].mapper.ts
      [feature-name].keys.ts
      [feature-name].constants.ts
      index.ts
```

Do not put all feature logic inside `page.tsx`.

---