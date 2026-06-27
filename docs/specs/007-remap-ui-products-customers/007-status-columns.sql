-- Feature 007: record status (active/inactive | active/discontinued)
-- Run manually in the Supabase SQL editor (repo has no supabase/ folder).
-- See docs/adr/0005-record-status-distinct-from-archive.md and CONTEXT.md.
--
-- Adds an operational on/off flag that is INDEPENDENT of soft-delete
-- (deleted_at). Inactive/discontinued rows stay visible in active lists
-- (deleted_at is still null); only deleted_at removes them. Existing rows
-- default to active. No RLS policy change is required:
--   * SELECT already returns rows where deleted_at is null (includes inactive).
--   * Toggling is_active is an ordinary UPDATE on a non-deleted row, already
--     permitted by the existing UPDATE policies.

alter table public.customers
  add column if not exists is_active boolean not null default true;

alter table public.products
  add column if not exists is_active boolean not null default true;
