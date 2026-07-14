# ISS-010 — Notifications/UI: unread count undercounts past 30; toast queue is unbounded

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P3 | Module: notifications / shared stores | Type: minor bugs (both self-documented) | Effort: Low

Two small, related UI-reliability fixes; grouped because both are one-file changes with existing `ponytail:` markers.

## Bug A — unread count derived from the loaded page only

- `src/features/notifications/hooks/use-notifications.ts` (~line 44), `ponytail:` comment: "derived from the loaded 30; undercounts if >30 unread exist."
- Fix: add a dedicated count query in `notifications.service.ts` using the SDK's head-count form:
  ```ts
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);
  ```
  (RLS already scopes to the recipient — do not add client-side recipient filters as a security measure, only as an optimization if desired.) Expose it via a new hook + query key (`notificationKeys` factory), invalidate it wherever the list is invalidated (mark-read mutations, realtime insert handler).
- Acceptance: when more than 30 unread notifications exist, the bell badge shall show the true total. Unit-test the service function with a mocked client.

## Bug B — toast queue grows without a cap

- `src/stores/toast-store.ts` — `pushToast` appends with no maximum; a burst of `autoClose: false` errors grows the array unbounded.
- Fix (one line in `pushToast`): keep only the most recent N (suggest 5): `toasts = [...toasts, next].slice(-5)`.
- Acceptance: when a sixth toast is pushed, the system shall drop the oldest so at most 5 are queued. Extend the existing store test if one exists; otherwise add a minimal one.

## Verification

`npm run test`, `npm run lint`, `npx tsc --noEmit` pass. Remove the two `ponytail:` comments once fixed.

## Breakage check

Bug A adds a query — confirm the realtime subscription also invalidates the count key or the badge will lag behind the list. Bug B only affects pathological bursts; no normal flow shows >2 toasts.
