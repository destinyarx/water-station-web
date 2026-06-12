# CODING_STANDARDS.md

## Purpose

This file defines the coding standards for this project.

AI coding agents must follow this document when creating, editing, reviewing, or refactoring code.

The goal is to keep the codebase:

* consistent
* readable
* type-safe
* maintainable
* scalable
* easy to debug
* easy for humans and AI agents to understand

---

## Tech Stack

This project uses:

* Next.js
* TypeScript
* TanStack Query
* TanStack Table
* React Hook Form
* Zod

Agents must not introduce additional major libraries unless the task clearly requires it or the user explicitly approves it.

---

## General Coding Principles

### 1. Keep code simple

Prefer simple, readable code over clever abstractions.

Do not create unnecessary wrappers, helpers, hooks, or abstractions unless they reduce real duplication or improve clarity.

### 2. Follow existing patterns

Before creating new files or structures, inspect the current project and follow its existing conventions.

If a similar feature already exists, copy the pattern and adapt it.

### 3. Keep changes focused

Only modify files related to the requested task.

Do not refactor unrelated code.

Do not change architecture unless the task explicitly requires it.

### 4. Prefer explicit code

Avoid magic behavior.

Use clear names, clear data flow, and clear validation.

### 5. Do not invent requirements

Only implement what is described in the task, specification, or existing code.

If requirements are unclear, make the smallest reasonable assumption and document it in the final response.

---

# TypeScript Standards

## Type Safety

Use TypeScript strictly.

Avoid `any`.

Use `unknown` when the type is truly unknown, then narrow it safely.

```ts
// Bad
const data: any = response.data;

// Better
const data: unknown = response.data;
```

Use explicit types for:

* API responses
* form values
* table rows
* service function parameters
* mutation inputs
* important domain objects

---

## Type Naming

Use clear type names.

```ts
type Customer = {
  id: string;
  name: string;
  phone: string;
};

type CreateCustomerInput = {
  name: string;
  phone: string;
};

type UpdateCustomerInput = {
  id: string;
  name?: string;
  phone?: string;
};
```

Use:

* `Input` for data sent into a function or mutation
* `Response` for API responses
* `Row` for table row types
* `FormValues` for React Hook Form values

---

## Avoid Large Types in Components

Do not define large domain types inside components.

Put shared types in a dedicated file, usually:

```txt
features/{feature-name}/{feature-name}.types.ts
```

Example:

```txt
features/customers/customers.types.ts
```

---

# File and Folder Structure

Use feature-based organization when possible.

Recommended structure:

```txt
features/
  customers/
    components/
      customer-form.tsx
      customers-table.tsx
      customer-columns.tsx
    hooks/
      use-customers.ts
      use-create-customer.ts
      use-update-customer.ts
      use-delete-customer.ts
    customers.api.ts
    customers.schema.ts
    customers.types.ts
    customers.constants.ts
```

## File Purpose

### `components/`

Contains UI components related to the feature.

Examples:

```txt
customer-form.tsx
customers-table.tsx
customer-columns.tsx
```

### `hooks/`

Contains React hooks for queries, mutations, and feature-specific client logic.

Examples:

```txt
use-customers.ts
use-create-customer.ts
```

### `{feature}.api.ts`

Contains API request functions.

This file should handle communication with the backend, route handlers, or external services.

### `{feature}.schema.ts`

Contains Zod schemas.

Use this for:

* form validation
* API input validation
* reusable validation rules

### `{feature}.types.ts`

Contains TypeScript types related to the feature.

### `{feature}.constants.ts`

Contains constants, options, table config values, or reusable static values.

---

# Naming Conventions

## Files

Use kebab-case for file names.

```txt
customer-form.tsx
use-create-customer.ts
customers-table.tsx
```

Do not use:

```txt
CustomerForm.tsx
useCreateCustomer.ts
CustomersTable.tsx
```

Exception: Follow existing project conventions if the codebase already uses another style.

---

## Components

Use PascalCase for React components.

```tsx
export function CustomerForm() {
  return <form>...</form>;
}
```

---

## Hooks

Use camelCase and start with `use`.

```ts
export function useCustomers() {}
export function useCreateCustomer() {}
```

---

## Variables and Functions

Use camelCase.

```ts
const customerName = "John";
function createCustomer() {}
```

---

## Constants

Use UPPER_SNAKE_CASE for global constants.

```ts
export const DEFAULT_PAGE_SIZE = 10;
```

For local options, camelCase is acceptable.

```ts
const statusOptions = ["active", "inactive"];
```

---

# Next.js Standards

## Server and Client Components

Use Server Components by default.

Only use `"use client"` when the component needs:

* React state
* React effects
* browser APIs
* event handlers
* React Hook Form
* TanStack Query
* TanStack Table interactive behavior

Example:

```tsx
"use client";

export function CustomerForm() {
  return <form>...</form>;
}
```

Do not mark entire pages as client components unless necessary.

Prefer keeping pages/server layouts as server components and moving interactive parts into smaller client components.

---

## Pages

Keep page files clean.

Page files should mostly:

* fetch initial data if needed
* compose components
* pass props
* define metadata if needed

Avoid putting large business logic directly inside page files.

Example:

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

---

## Route Handlers

Validate incoming request data with Zod.

Do not trust client input.

Example:

```ts
const body = await request.json();
const parsed = createCustomerSchema.safeParse(body);

if (!parsed.success) {
  return Response.json(
    { error: "Invalid request data", issues: parsed.error.flatten() },
    { status: 400 }
  );
}
```

---

# React Standards

## Component Rules

Keep components small and focused.

A component should have one clear responsibility.

If a component becomes too large, split it into smaller components.

---

## Props

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

---

## State

Keep state as close as possible to where it is used.

Do not create global state unless multiple unrelated parts of the app need it.

Prefer server state through TanStack Query for backend data.

---

# TanStack Query Standards

## Purpose

Use TanStack Query for server state, including:

* fetching lists
* fetching details
* creating records
* updating records
* deleting records
* cache invalidation

Do not use TanStack Query for simple local UI state.

---

## Query Keys

Use consistent query keys.

Create query key helpers when the feature grows.

Example:

```ts
export const customerQueryKeys = {
  all: ["customers"] as const,
  lists: () => [...customerQueryKeys.all, "list"] as const,
  list: (filters: CustomerFilters) =>
    [...customerQueryKeys.lists(), filters] as const,
  details: () => [...customerQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...customerQueryKeys.details(), id] as const,
};
```

---

## Query Hooks

Put query hooks inside the feature `hooks` folder.

Example:

```ts
export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: customerQueryKeys.list(filters),
    queryFn: () => getCustomers(filters),
  });
}
```

---

## Mutation Hooks

Use mutation hooks for create, update, and delete actions.

Invalidate related queries after successful mutations.

Example:

```ts
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerQueryKeys.all,
      });
    },
  });
}
```

---

## Error Handling

Do not silently ignore errors.

Expose errors to the UI when useful.

Example:

```tsx
if (query.isError) {
  return <p>Something went wrong while loading customers.</p>;
}
```

---

## Loading States

Always handle loading states for async data.

Example:

```tsx
if (query.isLoading) {
  return <p>Loading customers...</p>;
}
```

---

# TanStack Table Standards

## Purpose

Use TanStack Table for complex tables that need:

* sorting
* filtering
* pagination
* column visibility
* row selection
* custom column rendering

For very simple tables, a regular HTML table is acceptable.

---

## Column Definitions

Put column definitions in a separate file when the table is large.

Example:

```txt
features/customers/components/customer-columns.tsx
```

Example:

```tsx
import type { ColumnDef } from "@tanstack/react-table";

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
];
```

---

## Table Component

Keep table rendering separate from data fetching when possible.

Preferred pattern:

```tsx
export function CustomersTable() {
  const customersQuery = useCustomers();

  if (customersQuery.isLoading) {
    return <p>Loading customers...</p>;
  }

  if (customersQuery.isError) {
    return <p>Failed to load customers.</p>;
  }

  return <DataTable columns={customerColumns} data={customersQuery.data ?? []} />;
}
```

---

# React Hook Form Standards

## Purpose

Use React Hook Form for forms.

Use Zod for validation.

Use `zodResolver` to connect Zod schemas to forms.

---

## Form Schema

Define form schemas in:

```txt
features/{feature}/{feature}.schema.ts
```

Example:

```ts
import { z } from "zod";

export const customerFormSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
```

---

## Form Setup

Example:

```tsx
const form = useForm<CustomerFormValues>({
  resolver: zodResolver(customerFormSchema),
  defaultValues: {
    name: "",
    phone: "",
  },
});
```

---

## Form Submit

Keep submit logic clear.

Example:

```tsx
function onSubmit(values: CustomerFormValues) {
  createCustomerMutation.mutate(values);
}
```

Do not put complex API logic directly inside the form component.

Prefer calling mutation hooks.

---

## Default Values

Always provide default values for forms.

```tsx
defaultValues: {
  name: "",
  phone: "",
}
```

Avoid undefined form values unless required.

---

# Zod Standards

## Purpose

Use Zod for:

* form validation
* API input validation
* shared validation rules
* safe parsing of unknown data

---

## Schema Naming

Use clear schema names.

```ts
export const createCustomerSchema = z.object({});
export const updateCustomerSchema = z.object({});
export const customerFormSchema = z.object({});
```

---

## Infer Types From Schema

When possible, infer form and input types from Zod schemas.

```ts
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
```

Avoid duplicating types manually when they can be inferred from Zod.

---

## Use Safe Parse

Use `safeParse` when validating unknown data.

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

# API Function Standards

## API Functions Should Be Small

Each API function should do one job.

Example:

```ts
export async function getCustomers() {}

export async function getCustomerById(id: string) {}

export async function createCustomer(input: CreateCustomerInput) {}

export async function updateCustomer(input: UpdateCustomerInput) {}

export async function deleteCustomer(id: string) {}
```

---

## Return Typed Data

API functions should return typed results.

```ts
export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch("/api/customers");

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}
```

---

## Handle Failed Requests

Always check `response.ok`.

```ts
if (!response.ok) {
  throw new Error("Failed to create customer");
}
```

Do not assume all requests succeed.

---

# Error Handling Standards

## User-Facing Errors

Show useful but safe error messages to users.

Do not expose sensitive technical details.

Good:

```txt
Failed to save customer. Please try again.
```

Bad:

```txt
Postgres foreign key violation on table customers...
```

---

## Developer Errors

Use clear error messages in code.

```ts
throw new Error("Customer ID is required to update customer.");
```

---

# Loading and Empty States

Every data-driven UI should handle:

* loading state
* error state
* empty state
* success/data state

Example:

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

# Forms and Mutations

When submitting forms:

* disable submit button while submitting
* show loading state
* validate using Zod
* use mutation hooks
* handle success
* handle error
* reset form only when appropriate

Example:

```tsx
<button type="submit" disabled={createCustomerMutation.isPending}>
  {createCustomerMutation.isPending ? "Saving..." : "Save"}
</button>
```

---

# Import Standards

Use organized imports.

Preferred order:

```ts
// React / Next
import Link from "next/link";

// Third-party libraries
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// Internal imports
import { CustomerForm } from "@/features/customers/components/customer-form";
import type { Customer } from "@/features/customers/customers.types";
```

Use type-only imports when importing types.

```ts
import type { Customer } from "./customers.types";
```

---

# Component Export Standards

Prefer named exports.

```tsx
export function CustomerForm() {}
```

Avoid default exports for reusable components unless the framework requires it.

Next.js page files may use default exports because Next.js requires them.

---

# Comments

Write comments only when they add value.

Good comments explain why something exists.

Bad comments repeat what the code already says.

```ts
// Good: explains why
// Keep previous filters when refreshing after mutation.
queryClient.invalidateQueries({ queryKey: customerQueryKeys.lists() });

// Bad: repeats the obvious
// Create customer
createCustomer(input);
```

---

# AI Agent Rules

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
11. Do not place API calls directly in deeply nested UI components.
12. Use Zod for validation.
13. Use React Hook Form for forms.
14. Use TanStack Query for server state.
15. Use TanStack Table for complex tables.
16. Keep components small and focused.
17. Prefer readable code over clever code.
18. Explain assumptions in the final response.

---

# Recommended Feature Pattern

When building a new feature, use this flow:

1. Define the Zod schema.
2. Infer TypeScript types from the schema.
3. Create API functions.
4. Create TanStack Query hooks.
5. Create form components using React Hook Form.
6. Create table columns if needed.
7. Create page-level composition.
8. Add loading, error, and empty states.
9. Test the main user flow manually or with existing test tools.

---

# Example Feature Structure

```txt
features/customers/
  components/
    customer-form.tsx
    customers-table.tsx
    customer-columns.tsx
  hooks/
    use-customers.ts
    use-create-customer.ts
    use-update-customer.ts
    use-delete-customer.ts
  customers.api.ts
  customers.schema.ts
  customers.types.ts
  customers.constants.ts
```

---

# Example Schema

```ts
import { z } from "zod";

export const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
```

---

# Example API File

```ts
import type { Customer, CreateCustomerInput } from "./customers.types";

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch("/api/customers");

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}

export async function createCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create customer");
  }

  return response.json();
}
```

---

# Example Query Hook

```ts
import { useQuery } from "@tanstack/react-query";

import { getCustomers } from "../customers.api";

export const customerQueryKeys = {
  all: ["customers"] as const,
  list: () => [...customerQueryKeys.all, "list"] as const,
};

export function useCustomers() {
  return useQuery({
    queryKey: customerQueryKeys.list(),
    queryFn: getCustomers,
  });
}
```

---

# Example Mutation Hook

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCustomer } from "../customers.api";
import { customerQueryKeys } from "./use-customers";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerQueryKeys.all,
      });
    },
  });
}
```

---

# Example Form Component

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  customerFormSchema,
  type CustomerFormValues,
} from "../customers.schema";
import { useCreateCustomer } from "../hooks/use-create-customer";

export function CustomerForm() {
  const createCustomerMutation = useCreateCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
    },
  });

  function onSubmit(values: CustomerFormValues) {
    createCustomerMutation.mutate(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("name")} placeholder="Customer name" />
      {form.formState.errors.name && (
        <p>{form.formState.errors.name.message}</p>
      )}

      <input {...form.register("phone")} placeholder="Phone number" />
      {form.formState.errors.phone && (
        <p>{form.formState.errors.phone.message}</p>
      )}

      <input {...form.register("address")} placeholder="Address" />

      <button type="submit" disabled={createCustomerMutation.isPending}>
        {createCustomerMutation.isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

---

# Example Table Columns

```tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { Customer } from "../customers.types";

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
];
```

---

# Final Rule

When in doubt, choose the option that makes the code easier for a human developer to read, maintain, and safely modify.
