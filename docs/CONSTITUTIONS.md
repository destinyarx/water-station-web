# Project Constitution

## Non-Negotiable Rules

1. TypeScript must be strict.
2. No `any` unless explicitly justified with a comment.
3. All Supabase tables in public schema must have RLS enabled.
4. Service role key must never be used in client components.
5. Business logic must live in feature modules, not directly inside pages.
6. New features must start with a spec folder.
7. Code should follow the established folder structure and patterns.
Avoid unnecessary abstraction.
8. No direct database schema changes without a migration file.
9. Every mutation must include validation using Zod.
10. Every protected route must check authentication.
11. Agents must not create new architecture patterns without updating docs.