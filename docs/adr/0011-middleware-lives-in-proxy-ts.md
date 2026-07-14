# Auth middleware lives in `src/proxy.ts` (non-standard filename, confirmed active)

Status: proposed — retroactive documentation of an existing fact (fable review, 2026-07-14); owner to accept, and to decide the optional rename.

## Context

All auth/onboarding gating (unauthenticated → sign-in, unregistered → `/complete-registration`, public/legal route exceptions) is implemented with `clerkMiddleware` in `src/proxy.ts`. No `middleware.ts` exists. During the 2026-07-14 documentation pass, multiple reviewers independently flagged the non-standard filename as possible dead code — which would have meant the entire auth gate was silently inactive.

It is not. Runtime evidence (`docs/specs/010-rebuild-ui-ux-deliveries-module/next-dev.log`) shows Next.js 16.2.7's own per-request timing reporting `proxy.ts` as a first-class phase on every request (e.g. `proxy.ts: 55ms`), alongside the file's `[Middleware Log]` output. Next.js executes it natively on this version. Full evidence trail: `docs/ai-handoff/03-specification-status.md` row 1.

## Decision

- `src/proxy.ts` is the single middleware entry point; it is active and load-bearing. Do not create a second `middleware.ts` — two entry points would be worse than one oddly-named one.
- Any change to route gating happens in this file (matchers `isPublicRoute`, `isLegalRoute`, `isRegistrationRoute`).
- Open sub-decision for the owner: optionally rename to `middleware.ts` purely for convention clarity. If renamed, run the full sign-in → onboarding → protected-route manual QA for both roles immediately after (see `docs/ai-handoff/fable-review-2026-07-14/issues/ISS-008-security-defense-in-depth-auth.md` for the flow).

## Consequences

- Future agents must not conclude the auth gate is dead code from the filename alone.
- Middleware remains a single point of failure for route gating; ISS-008 adds a defense-in-depth layout check so it isn't the only gate.
