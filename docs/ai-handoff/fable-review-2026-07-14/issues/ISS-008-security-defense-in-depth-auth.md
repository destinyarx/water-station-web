# ISS-008 — Security: add defense-in-depth server-side auth to `(protected)` layout; gate middleware logging in production

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P1 | Module: auth / middleware | Type: hardening (no known live vuln) | Effort: Low

## Goal

Add a second server-side auth gate under `(protected)` so route protection does not depend solely on `src/proxy.ts` middleware, and stop per-request console logging in production.

## Context

- `src/proxy.ts` (Clerk middleware — **confirmed active** via runtime log evidence, see `docs/ai-handoff/03-specification-status.md` row 1) is currently the **only** auth gate for every protected page except `/ai-assistant` (the only page with its own `auth()` check).
- If the middleware matcher ever misses a new route, or a deploy/config change bypasses middleware, nothing else blocks page render — only Supabase RLS protects the data underneath.
- Separately, `proxy.ts` logs `[Middleware Log] {...}` on **every request** (route metadata + userId presence flag; no PII/secrets). Fine in dev, noise in production.

Evidence: `docs/ai-handoff/10-security-and-risks.md` rows 2 and 5 (grep confirmed `auth()` appears only in `ai-assistant/page.tsx` and `proxy.ts`).

## Steps

1. In `src/app/(protected)/layout.tsx` (create the layout auth block if the layout doesn't do this yet — read it first), add a server-side check mirroring what middleware enforces:
   ```ts
   const { userId, sessionClaims } = await auth();
   if (!userId) redirect('/sign-in');
   if (!sessionClaims?.organization) redirect('/complete-registration');
   ```
   Use the exact claim names middleware already reads (`organization`, `is_owner` — see `src/types/globals.d.ts`). This is one check for all protected pages; per-page checks are not needed.
2. Confirm `/complete-registration` itself lives under `(auth)`/its own segment (not `(protected)`) so the redirect can't loop. **Trace this before merging** — a wrong redirect target here locks users out of the app.
3. In `src/proxy.ts`, wrap the `console.log('[Middleware Log]', ...)` in `if (process.env.NODE_ENV !== 'production')`.
4. Manual QA: signed-out → `/dashboard` redirects to sign-in; signed-in-unregistered → redirects to complete-registration; registered owner and staff → pages load; `/ai-assistant` owner-gating unchanged.

## Acceptance criteria

- While middleware is bypassed or misconfigured, when an unauthenticated request reaches any `(protected)` page, the system shall still redirect to sign-in via the layout check.
- When `NODE_ENV` is `production`, the system shall not emit the per-request `[Middleware Log]`.
- The full sign-in → onboarding → protected-route flow shall work for both roles (manual QA), and `npm run test` / lint / typecheck pass.

## Files

- `src/app/(protected)/layout.tsx`
- `src/proxy.ts`

## Breakage check

Highest risk is a **redirect loop** if the layout redirects to a route that is itself under `(protected)`. Verify the route-group placement of `/complete-registration` and `/sign-in` before writing the redirect. The layout check runs on every protected page render — it uses Clerk's request-scoped `auth()`, which adds no extra network call, so no performance concern.
