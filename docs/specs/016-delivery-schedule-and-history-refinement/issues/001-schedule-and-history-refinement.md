# Issue 001 - Schedule and History Refinement

## Tasks

- [x] Reassert shared-member schedule lifecycle database enforcement.
- [x] Add server-side recurring-schedule search/status/type filters.
- [x] Add bounded schedule Current/Next occurrence and item projections.
- [x] Redesign the recurring-schedule dialog with Tailwind and wider layout.
- [x] Add server-side terminal history filter and chronological ordering.
- [x] Redesign delivery history with collapsed item details.
- [x] Update ADR/database/domain documentation.
- [x] Add focused tests and run the full verification suite.
- [x] Restrict the main current-delivery queue to active parent schedules so
      Stop hides and Resume restores eligible queue visibility.
- [x] Preserve completed, cancelled, and failed occurrences across schedule
      Stop/Resume.

## Done when

Every item in `ACCEPTANCE.md` is verified or explicitly recorded as manual, the
versioned migration is ready for human application, and no unrelated module is
changed.
