# Testing

## Test Command

Use Vitest for automated tests.

Run:

```bash
npm run test
```

## Feature Test Placement

All feature-related tests must be placed inside the specific feature folder under a dedicated `tests` directory.

Use this structure:

```txt
src/features/[feature-name]/tests/
```

Examples:

```txt
src/features/customers/tests/customer-form.test.tsx
src/features/customers/tests/customer-schema.test.ts
src/features/customers/tests/customer-service.test.ts
src/features/products/tests/products.service.test.ts
```

When creating tests for a feature:

- Do not place feature-specific tests directly beside source files unless that feature already uses that pattern.
- Do not place feature-specific tests in a global `src/tests` folder.
- Create a `tests` folder inside the related feature folder if it does not already exist.
- Keep test files clearly named based on what they validate.

## Test Expectations

For each feature, prefer focused tests for:

- Zod schema validation
- mapper behavior
- query key factories
- permission/guard helpers
- Supabase service behavior with mocked clients
- mutation invalidation behavior
- critical component flows when useful

Supabase service tests should verify observable behavior:

- correct table and column selection
- `deleted_at` filtering for active lists
- `org_id` and `created_by` handling from trusted identity context
- Supabase error handling
- returned data mapping

## Manual Verification

Manual verification is required for:

- RLS tenant isolation
- Clerk session claim behavior
- cross-organization access attempts
- owner/staff permission differences
- soft-delete behavior for tables with `deleted_at`
- loading, error, empty, and populated UI states

Document any manual RLS verification steps in `docs/DATABASE.md` or the relevant feature spec.
