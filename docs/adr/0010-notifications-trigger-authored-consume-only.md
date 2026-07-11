# Notifications are trigger-authored and consume-only, with column-locked `is_read`

Status: accepted (feature 013-realtime-notifications-features)

## Context

`public.notifications` delivers personal, real-time messages to a single
`recipient_id`. Rows are produced by business events (first one shipped:
maintenance assignment), and the client must be able to mark them read — but must
not be able to forge notifications or tamper with `recipient_id` / `org_id` /
`created_by`. Two constraints made the obvious "give the client an INSERT/UPDATE
policy" wrong:

1. A notification's recipient is usually **not** the actor (you assign a task to
   someone else). A client-side insert would let any user fabricate rows for
   anyone, and RLS `WITH CHECK` can't express "insert for another user, but only
   as a side effect of a legitimate action."
2. RLS cannot restrict **which columns** an UPDATE changes — `WITH CHECK` only sees
   the new row, never old-vs-new. So "user may change only `is_read`" is not
   expressible as a policy.

Transport also had a fork: Supabase **Postgres Changes** vs **Broadcast from
Database**.

## Decision

- **Trigger-authored, consume-only.** All inserts come from `SECURITY DEFINER`
  triggers (one per source event). `created_by` is the human actor
  (`NEW.created_by`); `recipient_id` is the target. There is **no INSERT RLS
  policy** — authenticated clients simply cannot insert.
- **Column-locked update.** `REVOKE INSERT, UPDATE ... FROM authenticated`, then
  `GRANT UPDATE (is_read) ... TO authenticated`, plus a `FOR UPDATE USING
  (recipient_id = auth.jwt()->>'sub')` policy. The column grant — not a policy or a
  trigger — is what limits changes to `is_read`.
- **SELECT** = `recipient_id = auth.jwt()->>'sub' AND private.is_org_member(org_id)`.
- **Transport = Postgres Changes** (not Broadcast). The RLS SELECT policy is the
  security boundary on the realtime stream; the `recipient_id=eq` filter is only a
  bandwidth optimization.
- `type` is a **free `varchar` category**, not a DB enum, so new modules add
  notification kinds with no migration.

## Consequences

- A guard trigger to protect columns is unnecessary; the column `GRANT` is the
  whole mechanism. Anyone reading the migration must know the grant — not a policy —
  is what enforces "read-only except `is_read`."
- Every future notification source is a `SECURITY DEFINER` trigger; there is no
  application code path that inserts a notification. Reviewers should reject any
  client-side insert.
- Postgres Changes carries a per-connection RLS cost and a global connection
  ceiling. Acceptable at water-station scale; revisit (switch to Broadcast) only if
  concurrency becomes a real problem — this is the reversible part of the decision.
- With supabase-js's Clerk `accessToken` option, Realtime must actually inherit the
  token or RLS silently drops all events. This is an operational risk to verify, not
  a design flaw — see feature 013 context §5.

## Alternatives rejected

- **Client INSERT/UPDATE policies** — cannot express cross-user insert safely, and
  cannot column-lock an update.
- **`BEFORE UPDATE` guard trigger** — more code for the same guarantee the column
  grant gives for free.
- **Broadcast from Database** — more moving parts (a broadcast trigger, payload
  plumbing) for scale this app doesn't have yet.
- **`type` as an enum** — would force a migration every time a module introduces a
  new notification kind.
