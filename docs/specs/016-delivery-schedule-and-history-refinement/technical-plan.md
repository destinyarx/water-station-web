# Technical Plan

## Status

Implemented on 2026-07-18. The earlier ADR 0015 policy repair and
active-schedule queue-view migrations are present in linked history. A new
atomic Stop migration is present locally and intentionally not applied by the
agent. Current verification results are recorded in `ACCEPTANCE.md` and the
task handoff.
Signed-in browser and RLS QA remain manual because no in-app browser backend
was available.

## Data and permissions

1. Add filter types and query-key inputs for schedules and history.
2. Parse a paginated schedule projection containing customer, schedule items,
   and bounded Current/Next occurrence aliases.
3. Resolve linked-customer name matches to organization-scoped customer IDs,
   then filter schedules by matching `customer_id` or `guest_name` alongside
   customer type and active/inactive status, retaining limit-plus-one pagination.
4. Filter history by terminal status and order by `updated_at` with stable
   tie-breakers before paging.
5. Add a versioned migration that reasserts ADR 0015's shared-member schedule
   and delivery update policies, including soft-delete-safe `WITH CHECK` rules.
6. Replace `v_current_deliveries` with the same security-invoker projection and
   current-queue date/status rules plus an active-parent-schedule predicate.
   This makes Stop/Resume control queue visibility without mutating terminal
   occurrence rows.
7. Replace Stop's two independent Data API updates with
   `pause_delivery_schedule_atomic(integer, date)`. The security-invoker RPC
   changes the parent and archives only today/future pending occurrences in one
   transaction without returning the newly soft-deleted rows.

## Interface

1. Rebuild the schedule dialog's touched markup with Tailwind utilities,
   responsive search/filter controls, card hierarchy, compact item details,
   Current/Next context, and permission indicators.
2. Rebuild the history dialog's touched markup with Tailwind utilities,
   debounced customer search, terminal filters, chronological date/time,
   recipient context, and collapsed item details.
3. Increase modal width and reserve right-side scroll gutter without changing
   shared modal behavior.

## Verification

1. Add focused service/view/guard tests.
2. Run typecheck, lint, focused tests, full tests, and production build.
3. Document manual owner/staff and cross-organization RLS checks.
