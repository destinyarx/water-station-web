# ARC-001 — Push list filtering/search/pagination into the service layer (every module fetches all rows)

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P1 | Modules: customers first, then products / expenses / documents | Effort: Medium (per module, once the pattern exists)

## Problem

Every module's list service selects **all** non-deleted rows and does search/filter/paging client-side. Template case: `getActiveCustomers(client)` in `src/features/customers/services/customers.service.ts` takes no args; `CustomerFilters` in `customers.keys.ts` is `{ archived: boolean }` only. Every later feature copied this shape, so the cost compounds per module as tenant data grows. (`docs/ai-handoff/11-quality-and-improvements.md` Q04)

## Target design (do customers first, as the reference implementation)

1. Widen the service signature:
   ```ts
   export async function getActiveCustomers(
     client: SupabaseClient,
     filters: { search?: string; type?: CustomerType; page: number; perPage: number },
   ): Promise<{ rows: CustomerRow[]; total: number }> { ... }
   ```
   Implement with `.ilike('name', `%${search}%`)`, `.eq('type', type)`, `.range(from, to)`, and `{ count: 'exact' }` on the select. Keep the existing error-constant contract.
2. Extend `CustomerFilters` and wire `customerKeys.list(filters)` so each page/filter combination caches independently (the key factory already exists for exactly this).
3. Update `use-customers.ts` to accept filters and pass them through; add `placeholderData: keepPreviousData` so page changes don't flash empty.
4. Move the list page's search/filter/pagination state from client-side array ops to these query params. Preserve loading/error/empty states.
5. Update service tests (mocked client) for the new signature; add a test asserting `range` math (`page 2, perPage 20 → range(20, 39)`).
6. After customers ships and stabilizes, propagate the identical pattern to `products`, `expenses`, `documents` (separate PRs). Deliveries/maintenance have their own view models — assess separately.

## Constraints

- One module per PR. Do not do a mass rewrite.
- RLS remains the security boundary; these filters are UX only.
- No UI redesign — same components, different data source. If ISS/ARC work on TanStack Table (ARC-007) lands first, coordinate; otherwise this change is table-agnostic.

## Acceptance criteria

- When the customers list loads, the system shall request only one page of rows (network tab shows a ranged request, not the full table).
- When a search term is entered, filtering shall happen via the Supabase query (`ilike`), not in-memory.
- Pagination shall display the true total count from the server.
- `npm run test` / lint / typecheck pass; list loading/error/empty states unchanged.

## Breakage check

The list page currently assumes it holds the full array (client-side count badges, filters). Grep the customers page/components for `.filter(`/`.length` uses of the full list before changing the hook, and move each to server data or a separate count query. Debounce the search input so typing doesn't fire a query per keystroke.
