# Client-state store and data-table standards (resolving doc/code drift)

Status: accepted (owner decision implemented 2026-07-15)

## Context

Two documented standards contradict the shipped code (full analysis: `docs/ai-handoff/fable-review-2026-07-14/architecture-improvements/ARC-007-doc-code-drift-zustand-tanstack-table.md`):

1. `CLAUDE.md`/`AGENTS.md`/`docs/CODING_STANDARDS.md`/`docs/ARCHITECTURE.md` mandate **Zustand** for client/UI state, but `zustand` is not installed; the three stores (`sidebar`, `theme`, `toast`) are deliberate hand-rolled `useSyncExternalStore` pub/subs.
2. The same docs mandate **TanStack Table** for every data table; `@tanstack/react-table` is installed but unused — all list pages are hand-rolled grids.

Every agent that touches state or tables hits these conflicts and must guess. The drift, not either implementation, is the defect.

## Decision

**D1 — client state.** Keep the hand-rolled `useSyncExternalStore` pattern for the three small UI stores. It remains limited to client/UI state; TanStack Query owns server state and React Hook Form owns form state. Three tiny working stores do not justify another dependency.

**D2 — data tables.** Keep the shipped feature-specific table/grid markup and remove the TanStack Table mandate and unused dependency. Growing lists must use server-side pagination and filtering, but no rendering library is required.

## Consequences

- `CLAUDE.md`, `AGENTS.md`, `docs/CODING_STANDARDS.md`, and `docs/ARCHITECTURE.md` now describe the same shipped patterns.
- Future table-library adoption requires a new evidence-backed decision; agents must not silently retrofit existing list pages.
