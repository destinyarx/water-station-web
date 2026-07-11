# 013 — Real-time Notifications (validated context)

> Status: validated via grill session. This is the corrected spec after
> reconciling the original brief against the live architecture (ADR 0009,
> `client.ts`, `use-clerk-supabase.ts`, the `(protected)` route group, and the
> already-deployed maintenance trigger). Original brief kept in git history.

## 1. Scope

**Plumbing only.** Feature 013 delivers the notification *transport*: table (already
exists), RLS + privileges, Realtime subscription, a provider/hook, and the bell UI.
It does **not** define an event catalog — each module wires its own
`SECURITY DEFINER` trigger in its own spec, exactly like the maintenance one below.

**First (already-deployed) event — do not re-add:** `maintenance_tasks` INSERT, and
UPDATE OF `assigned_to`, call `create_maintenance_notification()` which inserts a
row with `recipient_id = NEW.assigned_to`, `created_by = NEW.created_by`,
`type = 'maintenance'`. This is the reference shape for all future triggers.

## 2. Domain model

- **Notification** — a personal, per-user message. Not an org broadcast.
  - `recipient_id` = the targeted user's `clerk_id` (who sees it).
  - `created_by` = the **human actor** whose action caused it (`NEW.created_by`
    in the trigger). There is no "system user"; the FK is always satisfiable.
  - `org_id` = the recipient's org uuid (tenant scope, defense-in-depth).
- **Consume-only client.** All inserts come from `SECURITY DEFINER` triggers. The
  client never inserts; it only reads and flips `is_read`.
- Known behavior (deferred): a user who assigns a task to themselves notifies
  themselves. Acceptable noise for v1; suppression is a trigger concern, not 013.

## 3. Schema (already deployed — reference only)

```sql
CREATE TABLE public.notifications (
    id serial PRIMARY KEY,
    recipient_id varchar(255) NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type varchar(25) NOT NULL DEFAULT 'info',   -- domain CATEGORY, not severity; free varchar (no enum)
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now(),
    org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by varchar(255) NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE
);
```

`type` is a **free-form category** (`'maintenance'`, `'info'`, future `'delivery'`…),
deliberately not a DB enum so a new module adds a type with zero migration. The UI
owns a `{ type -> {icon, color, route} }` lookup with a fallback for unknown types.

## 4. RLS & privileges (to implement)

`org_id` is the `organizations.id` uuid (ADR 0009); membership is checked via
`private.is_org_member(org_id)` (schema-qualified — the brief's unqualified
`is_org_member` was wrong).

```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- No INSERT policy: authenticated clients cannot insert. Only SECURITY DEFINER
-- triggers write rows. Revoke direct write, then grant ONLY the is_read column.
REVOKE INSERT, UPDATE ON public.notifications FROM authenticated;
GRANT  UPDATE (is_read) ON public.notifications TO authenticated;

-- Recipient reads only their own rows, and only within their org.
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT
  USING ( recipient_id = auth.jwt() ->> 'sub' AND private.is_org_member(org_id) );

-- Recipient may UPDATE their own rows; the column grant limits the change to is_read.
-- (RLS alone cannot restrict which columns change — WITH CHECK sees only the new
--  row, never old-vs-new. The column GRANT is what locks it to is_read.)
CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE
  USING ( recipient_id = auth.jwt() ->> 'sub' );
```

Why column-grant over a guard trigger: same guarantee, native, one line, no PL/pgSQL.

## 5. Realtime (Postgres Changes)

Transport = **Postgres Changes** (not Broadcast). Simple, no extra broadcast
trigger; the small per-org concurrency of a water station is well under the
connection ceiling. Migrate to Broadcast only if concurrency ever bites.

Required DB setup:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- REPLICA IDENTITY DEFAULT is fine (we filter/act on INSERT & UPDATE new-row data).
```

Subscription: listen to `INSERT` and `UPDATE` on `public.notifications` with filter
`recipient_id=eq.<clerkUserId>`.

- **RLS is the security boundary on the stream** (`notifications_select` runs per
  change). The `recipient_id=eq` filter is a **bandwidth optimization / defense-in-
  depth**, not what isolates tenants.
- **HIGHEST-RISK ITEM — verify at runtime.** With supabase-js 2.108 `accessToken`
  option, Realtime *should* inherit the Clerk token on `subscribe()`. If it does
  not, the socket connects unauthenticated, RLS silently drops **every** event, and
  you get zero notifications with no error. Implementation must (a) confirm events
  actually arrive for the recipient, and (b) if not, call
  `supabase.realtime.setAuth(await getToken({template:'water-station'}))` before
  subscribing and on token refresh.

## 6. Provider / hook

- Mount `NotificationProvider` in **`src/app/(protected)/layout.tsx`** (the route
  group is `(protected)`, **not** `(authenticated)` as the brief said). It runs for
  all authenticated routes only.
- Use the existing `useClerkSupabase()` client. Create the channel **once** in the
  provider, keyed by the Clerk user id; clean up on unmount; guard against double
  subscription (React strict-mode / re-render).
- `useNotifications()` exposes:
  ```ts
  { notifications, unreadCount, markAsRead(id), markAllAsRead(), loading }
  ```
- `unreadCount` derived from loaded state.
  `// ponytail: undercounts if >30 unread; upgrade to a count head-query if it matters`

## 7. UI behavior

- **Bell** lives in `src/components/layout/app-header.tsx`: unread badge, dropdown of
  latest notifications sorted `created_at DESC`.
- **Initial fetch:** latest **30** (`ORDER BY created_at DESC LIMIT 30`) — brief's
  unbounded `SELECT *` was a growth bug. Realtime prepends new INSERTs.
- **On click / open a notification:** optimistically set `is_read = true`, persist the
  single-column UPDATE, and **route by `type`** to that module's page
  (`maintenance` → `/maintenances`; unknown → no navigation). No per-row deep-link
  column in v1.
- **On INSERT while app is open:** surface via the **existing toast**
  (`components/app/toast.tsx`) — do not build a new toast.
- `markAllAsRead()` = one UPDATE `WHERE recipient_id = sub AND is_read = false`.

## 8. Deferred (with reason)

- **Dismissal / clearing** — mark-read only in v1. No `deleted_at`, no hard-delete.
- **Pruning / retention** — none; water-station volume won't hurt for a long time.
- **Per-row deep-link column** (`link_url` / `reference_id`) — route-by-type covers
  it without editing the already-deployed trigger.
- **Broadcast transport** — only if Postgres Changes concurrency becomes a problem.

## 9. Env — sufficient ✅

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` cover it. Realtime reuses the same URL + key +
Clerk token; the `'water-station'` template is hardcoded in `use-clerk-supabase.ts`.

## 10. Remaining implementation steps (not part of this validation)

1. Run the RLS/privilege/publication SQL (§4, §5) in the Supabase dashboard; save
   the SQL as `docs/specs/013-realtime-notifications-features/013-notifications.sql`.
2. Add a `public.notifications` section to `docs/DATABASE.md` (policies + manual RLS
   verification), synced with the SQL actually run.
3. Build `NotificationProvider` + `useNotifications` + bell dropdown; wire toast.
4. **Verify the Realtime auth path (§5) end-to-end** — the one thing most likely to
   fail silently.
5. Cross-tenant / cross-user RLS check: user B and org-B user must never receive
   user A's notifications via the stream or the initial fetch.
```
