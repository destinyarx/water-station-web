Feature Test Placement Rule

All feature-related tests must be placed inside the specific feature folder under a dedicated tests directory.

Use this structure:

src/features/[feature-name]/tests/

For example:

src/features/customers/tes
ts/
src/features/orders/tests/
src/features/products/tests/

When creating tests for a feature:

Do not place feature-specific tests directly beside the source files.
Do not place feature-specific tests in a global /src/tests folder.
Create a tests folder inside the related feature folder if it does not already exist.
Keep the test files clearly named based on what they validate.

Examples:

src/features/customers/tests/customer-form.test.tsx
src/features/customers/tests/customer-schema.test.ts
src/features/customers/tests/customer-service.test.ts
src/features/customers/tests/customer-api.test.ts