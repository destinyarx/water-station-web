-- =============================================================
-- Feature 009 — Documents Module
-- Authoritative migration for the public.documents table.
-- Run once in the Supabase dashboard SQL editor.
-- =============================================================

create table if not exists public.documents (
  id            bigint generated always as identity primary key,
  org_id        integer      not null references public.organizations(organization_code),
  created_by    varchar(255) not null references public.users(clerk_id),
  title         varchar(200) not null,
  description   text,
  category      text not null check (category in (
    'Business Permits',
    'Tax & BIR Documents',
    'Water Quality Tests',
    'Sanitary & Health',
    'Sales & Customer Receipts',
    'Expenses & Supplier',
    'Equipment & Maintenance',
    'Delivery & Vehicle',
    'Employee Documents',
    'Other'
  )),
  document_type text,
  document_date date,
  amount        numeric(12,2),
  expiry_date   date,
  visibility    text not null default 'all' check (visibility in ('all', 'only_me')),
  is_approved   boolean      not null default false,
  original_name text,                         -- filled by upload feature (future)
  created_at    timestamp    not null default now(),
  updated_at    timestamp,
  deleted_at    timestamp                      -- soft delete; null = active
);

-- Indexes
create index if not exists documents_org_idx
  on public.documents (org_id)
  where deleted_at is null;

create index if not exists documents_expiry_idx
  on public.documents (org_id, expiry_date)
  where expiry_date is not null and deleted_at is null;

-- Row Level Security
alter table public.documents enable row level security;

-- helpers (from Clerk JWT claims):
--   (auth.jwt() ->> 'organization')::int  = caller's org_id
--   (auth.jwt() ->> 'sub')                = caller's clerk_id
--   (auth.jwt() ->> 'is_owner')::boolean  = caller is the station owner

-- SELECT: org match + not deleted + visibility rule
-- staff see 'all' docs + their own 'only_me' docs; owners see everything in org
create policy "documents_select"
  on public.documents for select
  using (
    org_id = (auth.jwt() ->> 'organization')::int
    and deleted_at is null
    and (
      visibility = 'all'
      or created_by = (auth.jwt() ->> 'sub')
      or (auth.jwt() ->> 'is_owner')::boolean = true
    )
  );

-- INSERT: own org + own identity
create policy "documents_insert"
  on public.documents for insert
  with check (
    org_id = (auth.jwt() ->> 'organization')::int
    and created_by = (auth.jwt() ->> 'sub')
  );

-- UPDATE: own org; soft-delete and is_approved restricted to creator or owner
create policy "documents_update"
  on public.documents for update
  using (org_id = (auth.jwt() ->> 'organization')::int)
  with check (
    org_id = (auth.jwt() ->> 'organization')::int
    and (
      (auth.jwt() ->> 'is_owner')::boolean = true
      or created_by = (auth.jwt() ->> 'sub')
    )
  );
