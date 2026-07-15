-- Private organization-scoped document files. Review before applying.
alter table public.documents add column if not exists file_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members can view documents in their organization" on public.documents;
create policy "Members can view permitted documents in their organization"
on public.documents for select to authenticated
using (
  private.is_org_member(org_id)
  and deleted_at is null
  and (
    visibility = 'all'
    or created_by = private.current_user_id()
    or private.is_org_admin(org_id)
  )
);

create policy "Members can upload linked organization documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'documents'
  and exists (
    select 1 from public.documents d
    where d.file_path = name
      and d.org_id::text = (storage.foldername(name))[1]
      and d.created_by = private.current_user_id()
      and d.deleted_at is null
  )
);

create policy "Members can read permitted organization documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'documents'
  and exists (
    select 1 from public.documents d
    where d.file_path = name
      and d.deleted_at is null
  )
);

create policy "Creators and admins can delete organization document files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'documents'
  and exists (
    select 1 from public.documents d
    where d.file_path = name
      and (d.created_by = private.current_user_id() or private.is_org_admin(d.org_id))
  )
);

create index if not exists documents_file_path_idx on public.documents (file_path) where file_path is not null;
