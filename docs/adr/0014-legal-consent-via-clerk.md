> Renumbered from 0009 (fable review, 2026-07-14).

# 0014 — Legal consent captured by Clerk, not stored in our database

- **Status:** accepted
- **Date:** 2026-07-10
- **Feature:** `docs/specs/012-privacy-policy-and-terms-condition`

## Decision

Sign-up legal consent (agree to Terms, acknowledge Privacy Policy) is handled by
Clerk's built-in **legal consent** feature — a required checkbox on the embedded
`<SignUp>` component, enabled in the Clerk Dashboard, with links pointing to
`/terms-and-conditions` and `/privacy-policy`. Clerk records the acceptance
(`legalAcceptedAt`) on the user. We store **no** consent record in Supabase and
add **no** consent table, column, or checkbox to our own forms (neither the
Clerk sign-up nor the custom `complete-registration` form).

## Why

The app is a free, medium-sized tool and sign-up already runs entirely through
Clerk's embedded widget. Clerk's native legal-consent gate satisfies the
acceptance criterion ("consent unchecked → submission fails") with essentially
zero custom code and no migration — matching the spec's "no unnecessary database
changes." A hand-rolled checkbox would either have to be bolted onto Clerk's
hosted UI (awkward) or moved to the later `complete-registration` step (which
gates onboarding, not sign-up) and would then need its own storage.

## Consequences

- The checkbox uses Clerk's standard wording, **not** the exact custom error
  string in the spec's BDD (`"Please agree to the Terms and Conditions and
  acknowledge the Privacy Policy before continuing."`). Accepted trade-off.
- Enabling the checkbox is a **Clerk Dashboard** action (User & Authentication →
  Legal consent), not something in this repo. A future dev won't find consent
  logic or a consent table in the codebase — that absence is deliberate, not a
  gap to "fix."
- If consent auditing ever needs to live in our own data (e.g. versioned policy
  acceptance history), this decision must be revisited and a store added.
