 # ARC-007 — Resolve documented-vs-actual drift: Zustand (mandated, not installed) and (remove tanstack-table and react-table from the `docs`  in `CLAUDE.md` / `AGENTS.md` / `docs/CODING_STANDARDS.md` / `docs/ARCHITECTURE.md` )

> Author: Claude Fable 5 — review pass 2026-07-14
> Priority: P2 | Module: repo-wide standards | Effort: Low (amend docs) or High (retrofit code)
> Related proposed ADR: `docs/adr/0013-client-state-and-table-standards.md` (records the decision once made)

## Problem

Two standing rules in `CLAUDE.md` / `AGENTS.md` / `docs/CODING_STANDARDS.md` / `docs/ARCHITECTURE.md` do not match the shipped code, and every future agent hits the conflict:

1. **Zustand** is mandated for client/UI state, but `zustand` is not in `package.json`. The three stores (`src/stores/sidebar-store.ts`, `theme-store.ts`, `toast-store.ts`) are hand-rolled `useSyncExternalStore` pub/subs, each with a comment saying the substitution is deliberate. (`docs/ai-handoff/11-quality-and-improvements.md` Q11)

An agent following the docs will add a dependency / rewrite working UI; an agent following the code violates the docs. Either answer is fine — the drift is the bug.

## Decision points (tech lead / owner) — decide each independently

**Zustand — recommendation: amend the docs (Option B).** Three tiny working stores don't justify a new dependency (`docs/AI-GUARDRAILS.md` forbids unjustified deps).
- Option A: `npm i zustand`, rewrite the 3 stores, keep docs as-is.
- Option B: update `CLAUDE.md`, `AGENTS.md`, `docs/CODING_STANDARDS.md`, `docs/ARCHITECTURE.md` to describe the hand-rolled `useSyncExternalStore` pattern as the standard (same "client/UI state only" scope rules). Mark each edit "(amended by fable review, 2026-07-14)".



## Steps (after decisions)

1. Record both decisions in the proposed ADR 0013 (flip its status to accepted, fill in the chosen options).
2. Apply the doc edits (or the code work as separate per-feature PRs — never one mass rewrite).
3. All four docs must change in the **same PR** so they can't re-drift from each other.

## Acceptance criteria

- After this ticket, an agent reading `CLAUDE.md`/`docs/CODING_STANDARDS.md` and the codebase shall find zero contradiction about client-state stores or data tables.
- ADR 0013 shall record both decisions with rationale.

## Breakage check

Doc-only options carry zero runtime risk. Code options: Zustand rewrite touches theme/sidebar/toast used on every page — manual QA dark mode + sidebar + toasts; Table retrofit risks visual regressions on daily-use pages — per-feature PRs with before/after screenshots.
