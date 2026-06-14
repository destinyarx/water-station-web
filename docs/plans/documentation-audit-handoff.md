# Documentation Audit Handoff

## Purpose

This document captures a documentation audit for the Water Refilling Station Management System. It is intended for the next AI coding agent to use as a practical improvement plan for the project documentation and specs.

Primary source of truth: `AGENTS.md`.

The goal is to make the documentation clear, consistent, and useful for AI-assisted spec-driven development without over-engineering the docs.

---

## Overall Assessment

The documentation is close but not yet safe to hand to AI coding agents without supervision.

The project intent is strong:

- Water refilling station workflows, not generic CRUD
- Multi-tenant data scoped by `org_id`
- Clerk for identity
- Supabase for database and RLS authorization
- Supabase SDK service layer
- TanStack Query for server state
- React Hook Form and Zod for forms and validation
- shadcn/ui and Tailwind for UI
- Feature-based architecture under `src/features`
- Spec-driven development under feature specs

However, several docs conflict with `AGENTS.md` or the existing codebase. The biggest risks are agents using the wrong spec directory, creating `*.api.ts` files with `fetch`, following the default Next.js README, or missing current Supabase service-layer conventions.

---

## Highest Priority Fixes

1. Make `docs/specs` the single canonical spec location everywhere.
2. Resolve `docs/CONSTITUTION.md` vs `docs/CONSTITUTIONS.md`.
3. Rewrite `docs/CODING_STANDARDS.md` to remove `*.api.ts` and `fetch('/api/...')` patterns for normal Supabase database access.
4. Replace the default `README.md` with a project-specific README.
5. Expand `docs/TESTING.md` so agents know how to test services, schemas, mappers, query keys, Clerk identity behavior, and UI states.

---

## Major Issues

### 1. Spec Folder Conflict

`AGENTS.md` says active specs live inside `/specs`, but the repo actually uses `docs/specs`.

Current repo has:

```txt
docs/specs/
  000-auth_workflow/
  001-customers-basic-feature/
  002-products/
  003-expenses/
```

There is no root `/specs` directory.

Recommended fix:

- Replace all `/specs` and `specs/[feature-or-module]/` references with `docs/specs/[nnn-feature-name]/`.
- Keep one canonical spec location only: `docs/specs`.

---

### 2. Constitution Filename Mismatch

`AGENTS.md` references `docs/CONSTITUTION.md`, but the actual file is:

```txt
docs/CONSTITUTIONS.md
```

Recommended fix:

- Prefer renaming `docs/CONSTITUTIONS.md` to `docs/CONSTITUTION.md`.
- Update all existing references to use the singular filename.
- If renaming is not desired, update every reference to the plural filename consistently.

Preferred canonical name:

```txt
docs/CONSTITUTION.md
```

---

### 3. Coding Standards Conflict With Supabase Service Pattern

`AGENTS.md` requires:

- Supabase SDK for normal database queries
- Supabase query logic inside services
- Query hooks inside feature `hooks/`
- No raw `fetch` for normal Supabase database queries

But `docs/CODING_STANDARDS.md` still recommends:

- `customers.api.ts`
- `fetch('/api/customers')`
- API request functions as the core data access pattern

This conflicts with the actual feature structure, which uses:

```txt
src/features/[feature]/
  services/
    [feature].service.ts
```

Recommended fix:

Replace `*.api.ts` guidance with `services/[feature].service.ts` guidance.

Suggested replacement section:

```md
### `services/[feature].service.ts`

All normal Supabase database queries must live in feature services.

Services should:

- use the Supabase SDK, not raw `fetch`
- accept a Supabase client or use the project’s existing Supabase client helper
- handle Supabase errors explicitly
- exclude soft-deleted rows from active lists when the table has `deleted_at`
- never accept `org_id` or `created_by` from form input
- return typed domain/display objects after schema validation or mapping
```

---

### 4. README Is Still the Default Next.js Template

`README.md` still says the app is a create-next-app project and tells developers to edit `app/page.tsx`.

This is misleading because the project uses:

- `src/app`
- protected route groups
- feature modules
- Clerk
- Supabase
- project-specific specs and docs

Recommended fix:

Replace `README.md` with project-specific content:

```md
# Water Station Web

A Water Refilling Station Management System for small water refilling businesses.

## Stack

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

## Development

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Documentation Map

- `AGENTS.md` - primary instructions for AI coding agents
- `CONTEXT.md` - product and domain language
- `docs/CONSTITUTION.md` - non-negotiable engineering rules
- `docs/ARCHITECTURE.md` - architecture and folder structure
- `docs/CODING_STANDARDS.md` - implementation standards
- `docs/SECURITY.md` - auth, RLS, secrets, validation
- `docs/DATABASE.md` - schema and RLS policy documentation
- `docs/DESIGN.md` - design system
- `docs/TESTING.md` - testing rules
- `docs/specs/` - feature specs
```

---

### 5. Testing Documentation Is Too Thin

`docs/TESTING.md` currently covers only test placement.

It should also define:

- command: `npm run test`
- feature test location: `src/features/[feature]/tests/`
- what to test:
  - Zod schemas
  - mappers
  - guards
  - query keys
  - Supabase services with mocked clients
  - mutation invalidation
  - important form and table flows
- what requires manual verification:
  - RLS isolation
  - Clerk claim behavior
  - cross-organization access blocking

Suggested addition:

```md
## Test Expectations

Use Vitest for automated tests.

Run:

```bash
npm run test
```

Feature tests belong in:

```txt
src/features/[feature-name]/tests/
```

For each feature, prefer focused tests for:

- Zod schema validation
- mapper behavior
- query key factories
- permission/guard helpers
- Supabase service behavior with mocked clients
- mutation invalidation behavior
- critical component flows when useful

Manual verification is required for:

- RLS tenant isolation
- Clerk session claim behavior
- cross-organization access attempts
- soft-delete behavior for tables with `deleted_at`
```

---

## File-by-File Improvement Plan

### `AGENTS.md`

What it does well:

- Strong project context
- Good AI agent rules
- Clear tech stack and workflow expectations
- Strong multi-tenancy and security direction

Required edits:

- Fix typo: `te following markdown files`
- Fix encoding artifacts like smart quotes displayed incorrectly
- Replace `/specs` with `docs/specs`
- Replace `docs/CONSTITUTION.md` reference or rename file to match
- Mention `CONTEXT.md` as required reading for business/domain behavior
- Mention `docs/DATABASE.md` when touching schema, RLS, `org_id`, `created_by`, or `deleted_at`
- Mention `docs/AI-GUARDRAILS.md` or merge it into `AGENTS.md`

Suggested required-reading block:

```md
Before coding, the agent must read:

1. `docs/CONSTITUTION.md`
2. `docs/ARCHITECTURE.md`
3. `docs/CODING_STANDARDS.md`
4. `docs/SECURITY.md`
5. `CONTEXT.md` when the task affects product behavior or domain language
6. `docs/DATABASE.md` when the task touches Supabase tables, RLS, `org_id`, `created_by`, or `deleted_at`
7. `docs/DESIGN.md` when the task touches frontend UI
8. `docs/TESTING.md` when adding or changing tests
9. The relevant feature folder under `docs/specs/`
```

---

### `docs/ARCHITECTURE.md`

What it does well:

- Correctly describes Next.js App Router usage
- Correctly places business logic in `src/features`
- Correctly defines service-layer data flow
- Correctly lists the core stack

Recommended edits:

- Clarify that normal Supabase database access uses feature services, not `*.api.ts`
- Mention route groups under `src/app/(protected)` and `src/app/(auth)`
- Add a short note that pages compose feature components and should not own business logic

Suggested addition:

```md
## Route Composition

Next.js route files under `src/app` should stay thin. Protected pages should compose feature-level components from `src/features`.

Normal database access should flow through feature services:

UI -> validation -> hook/action -> feature service -> Supabase SDK -> RLS -> response
```

---

### `docs/CODING_STANDARDS.md`

What it does well:

- Useful TypeScript rules
- Good React component guidance
- Good TanStack Query guidance
- Good RHF/Zod guidance
- Good import/export guidance

Required edits:

- Remove `customers.api.ts` examples
- Remove `fetch('/api/customers')` examples for normal database work
- Replace API function sections with Supabase service sections
- Use single quotes in TypeScript examples
- Add examples for `services/[feature].service.ts`, `*.keys.ts`, `*.mapper.ts`, and `*.guards.ts`

Canonical feature structure should be:

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

---

### `docs/CONSTITUTIONS.md`

What it does well:

- Short and enforceable
- Defines key non-negotiables
- Useful for AI agents

Required edits:

- Rename to `docs/CONSTITUTION.md` or update all references
- Add explicit tenant rule:

```md
All organization-owned records must be scoped by `org_id`, and users must never access records from another organization.
```

- Add explicit identity rule:

```md
`org_id` and `created_by` must be derived from the authenticated Clerk session, never from user-editable form fields.
```

---

### `docs/DATABASE.md`

What it does well:

- Valuable RLS documentation
- Documents table columns, identity resolution, and policies
- Includes manual RLS verification steps

Recommended edits:

- Reconcile customer hard delete policy with the soft-delete preference in `AGENTS.md`
- Mark hard `DELETE` policies as legacy/admin-only if they remain
- Add or verify documentation for all implemented tables, especially expenses
- Keep policy docs synchronized with migrations

Suggested soft-delete clarification:

```md
For tables with `deleted_at`, application delete actions should soft-delete by setting `deleted_at = now()`. Hard `DELETE` policies should not be used by normal UI flows unless explicitly documented as an admin or maintenance operation.
```

---

### `docs/DESIGN.md`

What it does well:

- Concrete design tokens
- Clear water/purity direction
- Useful palette and component guidance

Recommended edits:

- Add practical dashboard constraints
- Prevent overuse of glassmorphism
- Add accessibility and responsive expectations
- Prefer restrained SaaS dashboard layout over decorative visuals

Suggested addition:

```md
## Dashboard UI Rules

This is an operational dashboard, not a marketing site.

- Prioritize readable tables, forms, dialogs, filters, and status indicators.
- Use shadcn/ui components before custom primitives.
- Use glass effects only for navigation or overlays when they improve clarity.
- Avoid decorative blur/orb backgrounds in workflow screens.
- Every data view must handle loading, error, empty, and populated states.
- Tables must remain readable on small screens through responsive layout, horizontal scroll, or simplified mobile presentation.
```

---

### `docs/SECURITY.md`

What it does well:

- Covers Clerk and Supabase secrets
- Requires RLS
- Requires Zod validation
- Warns against exposing secrets

Recommended edits:

- Remove duplicate input validation section
- Add explicit Clerk/Supabase claim contract
- Add `org_id` and `created_by` rules
- Mention soft delete security expectations

Suggested addition:

```md
## Clerk/Supabase Identity Contract

Organization-owned records must use:

- `org_id` from the current Clerk session `organization` claim
- `created_by` from the authenticated Clerk user id

Forms must not expose or submit `org_id` or `created_by`.

Supabase RLS must independently enforce organization isolation using the Clerk JWT claims forwarded to Supabase.
```

---

### `docs/TESTING.md`

What it does well:

- Correctly places feature tests under feature folders

Required edits:

- Add Vitest command
- Add service mocking expectations
- Add manual RLS verification expectations
- Remove stale `customer-api.test.ts` example or rename to `customer-service.test.ts`

---

### `docs/AI-GUARDRAILS.md`

What it does well:

- Concise and useful for AI agents

Recommended edits:

- Reference it from `AGENTS.md`, or merge its content into `AGENTS.md`
- Avoid leaving important agent rules in an unreferenced file

---

### `CONTEXT.md`

What it does well:

- Excellent domain language
- Useful distinction between stock-tracked and non-stock-tracked products
- Good Clerk onboarding claim description

Recommended edits:

- Reference it from `AGENTS.md`
- Clarify which modules are already implemented and which are future/planned
- Keep terminology aligned with specs: prefer `non-stock-tracked product`, avoid `service item`

---

### `README.md`

Required action:

Replace default Next.js content with a project-specific README.

The README should be human-friendly and agent-friendly. It should not duplicate every doc, but it should point to the correct docs.

---

## Recommended Documentation Structure

Use this structure:

```txt
AGENTS.md
CLAUDE.md
README.md
CONTEXT.md

docs/
  CONSTITUTION.md
  ARCHITECTURE.md
  CODING_STANDARDS.md
  SECURITY.md
  DATABASE.md
  DESIGN.md
  TESTING.md
  ENVIRONMENT.md
  SPEC_TEMPLATE.md
  AI-GUARDRAILS.md
  adr/
  specs/
    000-auth-workflow/
    001-customers/
    002-products/
    003-expenses/
  plans/
  tasks/
```

Do not add more docs unless they reduce ambiguity for agents.

---

## Optional New Docs

Only add these if useful:

### `docs/ENVIRONMENT.md`

Purpose:

- Public vs secret env vars
- Clerk/Supabase integration details
- JWT template name
- Supabase edge function URLs

### `docs/SPEC_TEMPLATE.md`

Purpose:

- Canonical structure for feature specs
- Required sections
- EARS-style examples
- Acceptance criteria checklist
- Task breakdown format

---

## Acceptance Criteria For The Documentation Cleanup

The cleanup is complete when:

- `AGENTS.md` references only existing files and paths.
- All docs agree that feature specs live under `docs/specs`.
- All docs agree that normal Supabase database access goes through feature services.
- No core guide recommends `*.api.ts` or `fetch('/api/...')` for normal Supabase database queries.
- README describes this water station app, not the default Next.js starter.
- Testing docs explain both automated Vitest expectations and manual RLS verification.
- Security docs explicitly describe Clerk claim usage for `org_id`, `created_by`, and owner/staff authorization.
- Design docs guide agents toward restrained operational dashboard UI.
- Existing feature specs remain product-specific and avoid generic CRUD language.

---

## Recommended Order Of Work

1. Fix `AGENTS.md` path and filename references.
2. Rename or reconcile `CONSTITUTIONS.md`.
3. Rewrite the conflicting parts of `CODING_STANDARDS.md`.
4. Replace `README.md`.
5. Expand `TESTING.md`.
6. Tighten `SECURITY.md`.
7. Add practical dashboard rules to `DESIGN.md`.
8. Update `DATABASE.md` for soft-delete and any missing implemented tables.
9. Optionally add `ENVIRONMENT.md` and `SPEC_TEMPLATE.md`.

---

## Final Recommendation

Fix the path, filename, and service-layer contradictions before asking an AI coding agent to modify feature specs or implement new features.

The highest-impact correction is to make the docs consistently say:

- specs live in `docs/specs`
- normal database access uses Supabase SDK feature services
- `org_id` and `created_by` come from Clerk session context
- RLS is the final authority for tenant isolation
- feature work must be planned from specs before implementation
