# ISS-007 — Security: `/playground` lets any authenticated user trigger real outbound emails

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: **P1** | Module: playground / security | Type: vulnerability (abuse surface) | Effort: Low

## Goal

Remove (or hard-gate) the `/playground` route so a real edge function that sends email to a free-text address is not reachable by every authenticated user in production.

## Context

- `src/app/(protected)/playground/page.tsx` + `src/features/playground/components/send-email-card.tsx` + `use-send-smooth-handler-email.ts` POST to the "Smooth Handler" Supabase Edge Function with a **free-text recipient email and name**.
- Reachable by any authenticated, registered user — owner or staff. Not linked in the sidebar, but "not linked" is not a control.
- Abuse cases: spam/phishing relay under the business's sender identity; cost burn. The frontend does no recipient allowlisting; whether the edge function rate-limits or allowlists server-side is **Unknown** (its source is outside this repo).

Evidence: `docs/ai-handoff/10-security-and-risks.md` playground row.

## Recommended fix (Option A): delete the route

The page is a leftover dev/test tool. Delete `src/app/(protected)/playground/` and `src/features/playground/` entirely. Grep first for any import from `features/playground` outside the feature itself (none expected).

## Fallback (Option B): keep it, gated

If the owner wants to keep it as an internal tool:
1. Gate it owner-only using the same route-level pattern as `/ai-assistant` (see ADR 0008, `src/app/(protected)/ai-assistant/page.tsx` — server-side `auth()` + `is_owner` claim check + redirect).
2. Additionally, ask the edge-function owner to confirm server-side recipient allowlisting and rate limiting — the client cannot enforce this.

## Acceptance criteria

- Option A: `/playground` shall return 404 and no playground code shall remain in `src/`.
- Option B: when a staff user (or unauthenticated user) requests `/playground`, the system shall redirect/deny; only owners shall reach the send-email form.
- `npm run test` / lint / typecheck pass.

## Files

- `src/app/(protected)/playground/page.tsx`
- `src/features/playground/**`

## Breakage check

No production feature depends on playground (verify with `grep -r "features/playground" src`). Deleting it cannot break the app. The edge function itself stays deployed either way — flag its server-side validation as a follow-up question to whoever owns the Supabase project (see `docs/ai-handoff/15-open-questions.md`, security table).
