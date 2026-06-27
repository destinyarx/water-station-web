# ADR 0004 — Dark mode scoped to landing page, sidebar/header, and expenses module only

- **Status:** Accepted (scope extended by feature 007 — see note below)
- **Date:** 2026-06-26
- **Feature:** `docs/specs/006-create-new-design-system-and-redesign-landing-page-expenses-ui`

> **Amendment (feature 007, 2026-06-27):** The same design system + dark mode was
> extended to the **customers** and **products** modules. The mechanism is
> unchanged (`html.dark` + `--app-*` tokens reused verbatim); only the set of
> redesigned surfaces grew. Deliveries and maintenance remain out of scope.

## Context

Spec 006 introduces a new design system and redesigns three surfaces: the public landing page,
the app sidebar/header, and the expenses module. Dark mode was requested as part of this redesign.

The app has multiple other modules (customers, deliveries, products, sales, maintenances, dashboard)
that were not in scope for spec 006 and have existing UI that was not redesigned.

## Decision

Dark mode support is implemented **only** on the three surfaces being redesigned in spec 006:

1. Public landing page (`src/features/landing/`)
2. App sidebar and header (`src/components/layout/app-sidebar.tsx`)
3. Expenses module (`src/features/expenses/components/`)

All other modules retain their existing light-only styling and are not touched.

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
- Pages outside the three scoped surfaces will appear light-only even when the user has
  toggled dark mode. This is a known, intentional limitation of this spec's scope.
- The `<html>` element dark class must be applied globally (the store sets `document.documentElement.classList`),
  but only the three scoped surfaces have dark-mode Tailwind variants in their components.
