# Project Constitution

## Non-Negotiable Rules

1. TypeScript must be strict.
2. No `any` unless explicitly justified with a comment.
3. All Supabase tables in the public schema must have RLS enabled.
4. Service role keys must never be used in client components.
5. Business logic must live in feature modules, not directly inside pages.
6. New features must start with a spec folder under `docs/specs`.
7. Code must follow the established folder structure and patterns.
8. Avoid unnecessary abstractions.
9. No direct database schema changes without a migration file.
10. Every mutation must include validation using Zod.
11. Every protected route must check authentication.
12. All organization-owned records must be scoped by `org_id`, and users must never access records from another organization.
13. `org_id` and `created_by` must be derived from the authenticated Clerk session, never from user-editable form fields.
14. Agents must not create new architecture patterns without updating docs.
