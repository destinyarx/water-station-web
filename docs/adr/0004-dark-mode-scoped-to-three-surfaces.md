# ADR 0004 — Dark mode scoped to landing page, sidebar/header, and expenses module only

- **Status:** Accepted (scope extended by features 007 and 010 — see notes below)
- **Date:** 2026-06-26
- **Feature:** `docs/specs/006-create-new-design-system-and-redesign-landing-page-expenses-ui`

> **Amendment (feature 007, 2026-06-27):** The same design system + dark mode was
> extended to the **customers** and **products** modules. The mechanism is
> unchanged (`html.dark` + `--app-*` tokens reused verbatim); only the set of
> redesigned surfaces grew. Deliveries and maintenance remain out of scope.

> **Amendment (feature 010, 2026-07-02):** The **deliveries** module (queue page,
> table, unified create/edit forms, history dialog, schedule list dialog, and the
> cancel/fail confirm dialogs) was rebuilt on the `--app-*` token system and now
> supports dark mode. `maintenance` remains the only module still out of scope —
> a future agent extending dark mode there should follow the same conversion
> pattern used for deliveries (swap hardcoded hex for `var(--app-*)` tokens,
> replace ad-hoc `Dialog`/`Card` usage with `AppModal`/`ConfirmDialog` where it
> fits). See `src/features/deliveries/components/` for a worked example.

> **Amendment (task 010-redesign-pre-registration, 2026-07-10):** All three public
> **auth surfaces** — complete-registration, sign-in, and sign-up — now support dark
> mode. They share `AuthShell` (`src/components/layout/auth-shell.tsx`), a `--lp-*`
> ocean shell that owns their single `initTheme()` call and carries the toggle. The
> complete-registration card/form use Tailwind + the `(--lp-*)` token shorthand; the
> Clerk `<SignIn>`/`<SignUp>` widgets are themed via `authAppearance(isDark)`
> (`src/app/(auth)/auth-appearance.ts`), since Clerk can't read our CSS tokens.
> `playground` is now the only remaining light-only surface. This task also set a
> **Tailwind-first styling rule** (plain CSS/inline styles only when Tailwind can't
> express it) — see `docs/CODING_STANDARDS.md` → Styling Standards and
> `docs/DESIGN.md` → Styling Approach.

## Context

Spec 006 introduces a new design system and redesigns three surfaces: the public landing page,
the app sidebar/header, and the expenses module. Dark mode was requested as part of this redesign.

The app has multiple other modules (customers, deliveries, products, sales, maintenances, dashboard)
that were not in scope for spec 006 and have existing UI that was not redesigned.

## Decision

Dark mode support is implemented on the three surfaces redesigned in spec 006, plus every
surface added since via amendment (customers, products, and — as of feature 010 — deliveries):

1. Public landing page (`src/features/landing/`)
2. App sidebar and header (`src/components/layout/app-sidebar.tsx`)
3. Expenses module (`src/features/expenses/components/`)
4. Customers module (`src/features/customers/components/`) — feature 007
5. Products module (`src/features/products/components/`) — feature 007
6. Deliveries module (`src/features/deliveries/components/`) — feature 010
7. Maintenance module (`src/features/maintenance/components/`) — converted alongside 007/010
8. Documents module (`src/features/documents/components/`) — converted alongside 007/010

9. Public auth surfaces — complete-registration, sign-in, sign-up (`src/app/complete-registration/`, `src/app/(auth)/`, `src/components/layout/auth-shell.tsx`) — task 010, on `--lp-*` tokens (Clerk widgets via `authAppearance`)

Only `playground` retains its existing light-only styling and is not touched.

Dark mode state is managed by a single Zustand store slice (`useThemeStore`) persisted to
`localStorage`. Both the landing page navbar and the app header each carry their own toggle
wired to the same store.

## Alternatives considered

**Full-app dark mode** — applying dark mode to every module simultaneously. Rejected because
the other modules were not redesigned in this spec; retrofitting dark mode onto untouched
components would expand scope significantly and risk regressions in working features.

**CSS `prefers-color-scheme` only** — following the OS preference without a manual toggle.
Rejected because the design files show an explicit toggle control in both the landing page and
the app header, and user preference should override OS setting.

## Consequences

- A future agent adding dark mode to other modules must extend the existing `useThemeStore`
  and apply the dark-mode classes consistently — the store is already in place.
- Pages outside the scoped surfaces will appear light-only even when the user has
  toggled dark mode. This is a known, intentional limitation of this spec's scope.
- The `<html>` element dark class must be applied globally (the store sets `document.documentElement.classList`),
  but only the scoped surfaces have dark-mode Tailwind variants / `--app-*` token usage in their components.
- `maintenance` and `documents` already use the `--app-*` token system in practice (built
  alongside/after feature 007) even though earlier revisions of this ADR didn't list them —
  treat any module using `var(--app-*)` tokens as dark-mode-supported regardless of whether
  it's explicitly enumerated above. `playground` is the only remaining light-only
  surface (the `/complete-registration` route and the `(auth)` sign-in/sign-up
  screens were all converted in task 010).
