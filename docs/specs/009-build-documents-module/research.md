# Document storage research

The source Supabase migration already provides organization-scoped document metadata but has no `file_path`, bucket, or visibility-aware SELECT policy. The approved implementation therefore adds a private bucket, linked object policies, a `file_path` column, and row visibility enforcement. Metadata is created first to obtain the identity id; the path is then persisted before upload so the Storage INSERT policy can prove that the object is linked to the authenticated creator's active row.

File retention on soft delete is deliberate: permanent deletion has no approved retention policy yet.
