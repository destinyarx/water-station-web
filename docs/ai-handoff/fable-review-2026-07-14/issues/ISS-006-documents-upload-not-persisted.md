# ISS-006 — Documents: "Upload document" never persists a file (metadata-only)

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P1 | Module: documents / database / storage | Type: functionality gap (UI promises what backend doesn't do) | Effort: Medium

## Goal

Wire the Documents upload dialog to Supabase Storage so a selected file is actually persisted, retrievable, and governed by the same org-scoping and soft-delete rules as the `documents` row — or, if deferred again, make the UI stop implying files are saved.

## Context

- `src/features/documents/components/upload-document-dialog.tsx` (~lines 36–38) carries an explicit `ponytail:` comment: file is selected client-side only; no bucket, no file-path column.
- `src/features/documents/documents.schema.ts` has no `file_path`/`storage_path` field; `documents.service.ts` never calls `.storage.from(...)`.
- Users see a drop-zone and "Upload document," but only a metadata row is created. This also blocks the mobile camera-capture story (`docs/ai-handoff/13-mobile-handoff.md`).

Evidence: `docs/ai-handoff/11-quality-and-improvements.md` Q03; `docs/ai-handoff/10-security-and-risks.md` documents row.

## Constraints

- **Do not create the bucket/column directly** — the storage + schema changes below are a manual migration for the DB owner.
- Product decisions needed first: max file size, allowed types (PDF/images?), retention. Get these before building.
- Security requirements (from the risk register — non-negotiable when this ships): server-side type/size validation via bucket settings (`allowed_mime_types`, `file_size_limit`), storage objects scoped by org, storage-layer access rules honoring the row's `visibility = 'only_me'` and soft-delete.

## Migration instructions (manual, for the DB owner)

1. Create a **private** storage bucket `documents` with `file_size_limit` and `allowed_mime_types` per the product decision.
2. Add column: `alter table public.documents add column file_path text;` (nullable — existing rows have no file).
3. Storage RLS on `storage.objects` for the bucket: path convention `"{org_id}/{document_id}/{filename}"`; policies mirroring the `documents` table rules — org membership for read (plus creator-only when the linked row is `only_me`), creator for insert/delete. Reuse the `private.is_org_member` / `auth.jwt()` patterns already used elsewhere; match the live pattern, don't invent one.
4. Document bucket + column + policies in `docs/DATABASE.md` (which currently has **no documents section at all** — add one) with a "fable 2026-07-14" note.

## Implementation steps (code, after migration)

1. Extend `documents.schema.ts` / `documents.types.ts` / mapper with `file_path`.
2. In `documents.service.ts`: upload to storage first, then insert the row with `file_path`; on insert failure, remove the uploaded object (best-effort cleanup). Serve downloads via `createSignedUrl` (private bucket — never public URLs).
3. Update the dialog: real progress/disabled state during upload, error toast on failure; list/detail views get a view/download action when `file_path` exists.
4. Soft delete: when `deleted_at` is set, keep the object (rows are restorable) — document this retention choice.
5. Tests: mapper + service tests with mocked storage client; keep the existing 208-test suite green.

## Acceptance criteria

- When a user submits the upload dialog with a valid file, the system shall persist the file to the private bucket and store its path on the row, and the user shall be able to open it via a signed URL.
- If the file exceeds the size limit or has a disallowed type, then the system shall reject it server-side (bucket enforcement), not merely via the `accept` attribute.
- When a document row is `only_me`, other org members shall not be able to fetch its storage object.
- `npm run test` / lint / typecheck pass.

## Files

- `src/features/documents/{documents.schema.ts,documents.types.ts,documents.mapper.ts}`
- `src/features/documents/services/documents.service.ts`
- `src/features/documents/components/upload-document-dialog.tsx` (+ list/detail views)
- `docs/DATABASE.md` (new documents section)

## Breakage check

`file_path` must be nullable and every read path must tolerate null (all pre-existing rows). Don't touch the approval/visibility logic — it works today. Storage policies are the highest-risk piece; verify with two test accounts (two orgs, two staff in one org) before calling done.
