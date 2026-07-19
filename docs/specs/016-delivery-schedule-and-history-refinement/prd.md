# Delivery Schedule and History Refinement

## Problem

Recurring schedule management can fail while stopping future occurrences, and
the policy used while soft-deleting future occurrences can reject a legitimate
organization member. The schedule and delivery-history dialogs also lack
the server-side filtering, operational context, and visual hierarchy needed for
larger station datasets.

## Goal

Make schedule lifecycle controls reliable and permission-aware, then refine the
schedule and history dialogs around water-station workflows without loading
unbounded records.

## Scope

- Preserve ADR 0015: any organization member may Stop/Resume an
  organization-owned delivery schedule.
- Make Stop a single database transaction so a failed occurrence archival
  cannot commit the parent schedule change by itself.
- Keep delivery occurrence status work shared across organization members.
- Hide every occurrence of a paused recurring schedule from the main delivery
  queue, and make eligible queue rows visible again when the schedule resumes.
- Preserve completed, cancelled, and failed occurrence records unchanged across
  Stop/Resume.
- Add server-side schedule search, status filtering, customer-type filtering,
  and limit-plus-one pagination.
- Show customer identity, schedule items, and the current due or next pending
  occurrence.
- Sort terminal delivery history by the actual terminal update timestamp.
- Add server-side history status filtering and limit-plus-one pagination.
- Present delivery items in a compact disclosure with product names,
  quantities, and unit labels.
- Increase both dialog widths and use the current app design tokens with
  Tailwind utilities.

## Out of scope

- Editing recurrence rules or schedule template items.
- Adding a database unit-of-measure column.
- Changing the shared permission model for operating delivery occurrences.
- Restricting Stop/Resume by schedule creator.
- Adding total-count queries or downloading entire history/schedule datasets.
- Changing terminal delivery outcomes as part of schedule Stop/Resume.
