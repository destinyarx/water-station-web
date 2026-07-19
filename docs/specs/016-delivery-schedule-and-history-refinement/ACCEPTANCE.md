# Acceptance Criteria

- [ ] Owner and staff can Stop/Resume any schedule in their organization.
- [ ] Stop can soft-delete that schedule's future pending occurrences without
      an RLS error.
- [x] Stop uses one security-invoker database transaction, so an occurrence
      archival failure cannot leave the parent schedule paused.
- [ ] Direct cross-organization schedule and occurrence writes remain rejected.
- [ ] Stopping a recurring schedule immediately removes all of its occurrences
      from the main delivery queue.
- [ ] Resuming a recurring schedule makes its eligible active-queue occurrences
      visible again without back-filling the paused gap.
- [x] Stop/Resume writes target only `pending` occurrences dated today or later;
      `completed`, `cancelled`, and `failed` occurrences remain unchanged.
- [x] Occurrence status work remains available to organization members.
- [x] Customer search, Active/Inactive, and Business/Household filters are
      server-side and reset pagination when changed.
- [x] Schedule pagination fetches one probe row and performs no total count.
- [x] Schedule cards show recipient, type, recurrence, status, items, and
      Current-or-Next pending delivery context.
- [x] History is ordered newest-first by terminal update time, including
      cancelled rows.
- [x] Completed/Failed/Cancelled filters are server-side.
- [x] History pagination fetches one probe row and performs no total count.
- [x] History item details are collapsed by default and show product,
      quantity/unit, and line total when expanded.
- [x] Both dialogs are wider, responsive, dark-mode compatible, and retain
      comfortable right-side scroll spacing.
- [x] Focused tests, typecheck, lint, full tests, and production build pass.
- [x] Manual RLS QA is recorded as a remaining step if authenticated database
      sessions are unavailable locally.
