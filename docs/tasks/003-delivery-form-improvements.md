## Status - [DONE]

# Deliveries Module UI/UX Improvements

## Task Overview

Improve the deliveries module UI/UX and behavior. Apply all changes only within
the deliveries module and related files required for this module to work
correctly.

This task is a UI/UX refinement of the existing deliveries module, not a new
feature scope. Do not add recurrence management, assignment, payment handling,
inventory deduction, or new delivery lifecycle behavior unless it already exists
in the current deliveries module.

Before making changes, read `AGENTS.md` first. For UI and styling decisions,
also read `docs/DESIGN.md`.

## Files to Start With

Primary files:

- `src/app/(protected)/deliveries/page.tsx`
- `src/features/deliveries/components/delivery-form.tsx`
- `src/features/deliveries/components/deliveries-page.tsx`
- `src/features/deliveries/components/deliveries-table.tsx`

Related delivery module files may be inspected and modified when necessary, but
do not change unrelated modules.

## Resolved Decisions for Handoff

- The correct project instruction file is `AGENTS.md`, not `AGENT.md`.
- The correct design file is `docs/DESIGN.md`, not a root `DESIGN.md`.
- The real delivery occurrence statuses are `pending`, `for_delivery`,
  `completed`, and `failed`. Do not use `delivered` or `cancelled`.
- The status filter is for **Delivery** occurrences, not Delivery Schedule
  status.
- The default page state must show `pending` deliveries sorted by
  `deliveryDate` oldest first.
- Search should remain client-side for this task and should filter the already
  loaded deliveries list.
- Search should match delivery item snapshot names and useful visible delivery
  text such as notes. Do not query Supabase separately for search in this task.
- The unit price must remain part of submitted form values, but the UI should
  present it as a read-only price display for this task.
- The quantity minimum is `1`. The `-` control must never reduce quantity below
  `1`.
- Decimal quantity is currently allowed by schema (`positive()` number). For the
  stepper controls, increment and decrement by `1`; preserve manual numeric
  entry unless validation rejects it.
- There is currently no project-wide toast component or toast dependency. Do not
  add a new dependency. Implement a small deliveries-page-local toast/status
  component if needed.
- There is currently no delivery update/edit flow in the deliveries module. This
  task must not invent one. Implement the success toast for create now; if an
  update flow exists by the time this task is picked up, wire the same toast
  pattern to update success too.
- Keep metric cards only if they still support the page hierarchy after the
  compact header and unified table section changes. Do not add more metric cards.

## Requirements

### 1. Quantity Input Stepper

In the delivery dialog form, update each item quantity control so users can
adjust the quantity using `+` and `-` controls.

Expected behavior:

- Users can still enter a valid number manually.
- The `+` button increases the quantity by `1`.
- The `-` button decreases the quantity by `1`.
- Quantity must not go below `1`.
- The control must work with React Hook Form state and the existing Zod schema.
- Styling should match the existing delivery form design.
- Controls must be disabled while the form submission is pending.

Implementation notes:

- Prefer `useWatch`, `setValue`, and existing form field registration patterns.
- Do not use `any`, `// @ts-ignore`, or unsafe non-null assertions.
- Keep layout stable on mobile and desktop.

### 2. Read-Only Unit Price Display

Update the unit price UI so it becomes a non-clickable read-only price display.

Expected behavior:

- It displays the price using the existing `pesoFormatter`.
- It is not clickable and does not look like an active action button.
- It remains readable in disabled or read-only visual states.
- It still preserves the submitted `unitPrice` value for validation and delivery
  item snapshot creation.
- It should look like a management-system price field/display, not a CTA.

Example display source:

```txt
pesoFormatter.format(120)
```

Implementation notes:

- Use a hidden registered input or another type-safe React Hook Form-compatible
  approach to preserve `items[index].unitPrice`.
- Do not remove unit price from `DeliveryFormValues`.
- Do not make unit price editable in this task.

### 3. Compact Delivery Page Header

Improve the delivery landing page header area.

Current issue:

- The existing large header consumes too much vertical space for an operational
  datatable page.

Expected changes:

- Replace the large header card with a compact page title section.
- Keep title, short description, and primary action button.
- Align the primary action button with the title section on desktop when space
  allows.
- Stack cleanly on mobile.
- Keep the visual hierarchy clear without excessive top whitespace.

Suggested direction:

```txt
Deliveries                         [New Delivery]
Prepare and track refill delivery runs.
```

### 4. Toast Notification for Create Success

Replace the current inline success message display on the landing page.

Current behavior:

- `Delivery created successfully.` is displayed directly on the page.

Expected behavior:

- The create success message appears as a toast-style notification.
- The toast automatically disappears after `3000ms`.
- Do not introduce a new toast dependency.
- Keep the implementation local to the deliveries module unless a project-wide
  toast component exists by the time this task is implemented.
- If a delivery update/edit flow exists when this task is implemented, use the
  same toast pattern for update success.

Recommended duration:

```txt
3000ms
```

### 5. Unified Search, Filters, Sorting, and Datatable Layout

Currently, the datatable and search are separated into different cards, which
makes the page feel cluttered.

Expected changes:

- Combine search, delivery status filter, date sort control, and datatable into
  one clean card or one visually unified section.
- Avoid scattering controls across separate cards.
- Keep the UI clean, professional, and easy to scan.
- Follow good datatable hierarchy: section title/summary, controls, table.
- Preserve loading, error, empty, no-results, and populated states.

### 6. Delivery Status Filter

Add a filter for delivery occurrence status.

Required status values:

```txt
all
pending
for_delivery
completed
failed
```

Expected behavior:

- Default selected status is `pending`.
- `all` shows deliveries regardless of status.
- The selected status correctly filters displayed deliveries.
- UI labels may be human-friendly, but stored/filter values must match the real
  code values exactly.
- Do not use `delivered` or `cancelled`.

Recommended labels:

```txt
All statuses
Pending
For delivery
Completed
Failed
```

### 7. Date Sorting

Add a date sort control based on the `deliveryDate` field.

Required sort values:

```txt
oldest
latest
```

Expected behavior:

- `oldest` sorts from earliest delivery date to latest delivery date.
- `latest` sorts from latest delivery date to earliest delivery date.
- Default selected sort is `oldest`.
- The initial UI control values must match the actual initial sorted data.

Recommended labels:

```txt
Oldest first
Latest first
```

### 8. Search and Filter Control Layout

Replace the single standalone search card with a responsive controls row inside
the unified table section.

Expected controls:

- Search input
- Delivery status filter
- Date sort control

Desktop example:

```txt
[Search deliveries...] [Status Filter] [Sort by Date]
```

Mobile behavior:

- Controls stack or wrap cleanly.
- Controls do not overflow.
- Labels and selected values remain readable.

### 9. Initial Datatable State

When the user first lands on the deliveries page, the datatable should show:

- Status: `pending`
- Sort by date: `oldest first`

Expected behavior:

- The initial filter state is `pending`.
- The initial sort state is `oldest`.
- The datatable initially displays pending deliveries sorted from oldest to
  latest.
- The selected control values match the rendered data.
- If there are no pending deliveries but other statuses exist, show the
  no-results state for the current filter, not the global empty state.

### 10. UI/UX Polish and Consistency

After merging search, filters, sorting, and datatable into one section, make
sure the design remains clean and professional.

Expectations:

- Clear page hierarchy.
- Compact but readable spacing.
- Consistent button and input styling.
- Proper alignment of search and filter controls.
- Responsive behavior for smaller screens.
- No unnecessary large empty spaces.
- No nested card-in-card layout.
- No unrelated UI changes outside the deliveries module.

## Constraints

- Apply changes only to the deliveries module and the protected deliveries route
  file if needed.
- Do not modify unrelated modules.
- Do not introduce new dependencies.
- Do not bypass or weaken Clerk/Supabase/RLS assumptions.
- Do not add delivery update/edit behavior unless it already exists before this
  task is picked up.
- Reuse existing components, utilities, and design patterns where possible.
- Keep TypeScript strict and avoid `any`.
- Use `pesoFormatter` for currency display.
- Use the real `DeliveryStatus` type or schema-derived values where practical.

## Acceptance Criteria

The task is complete when:

- The delivery form quantity input has working `+` and `-` controls.
- Quantity cannot be reduced below `1`.
- Manual valid quantity entry still works.
- The unit price display shows Philippine peso formatting and is no longer an
  editable/clickable field.
- Unit price is still submitted in `DeliveryFormValues`.
- The delivery landing page header is compact and redesigned.
- Create success feedback is shown as an auto-dismissing toast-style
  notification.
- Search, filters, sorting, and datatable are visually unified.
- A delivery status filter is available and uses `pending`, `for_delivery`,
  `completed`, and `failed`.
- Date sorting supports oldest and latest.
- The default landing state shows pending deliveries sorted oldest first.
- Loading, error, empty, no-results, and populated states still render
  correctly.
- The UI remains clean, responsive, and consistent with `docs/DESIGN.md`.
- No unrelated modules are affected.

## Verification Checklist

Run before handoff completion:

```txt
npm run lint
npx tsc --noEmit
npm run test
```

Manual checks:

- Open `/deliveries` with a registered Clerk session.
- Confirm the first render shows pending deliveries sorted oldest first.
- Create a delivery with at least one product item.
- Use `+` and `-` quantity controls and verify totals update.
- Confirm quantity cannot go below `1`.
- Confirm the unit price display is readable and non-clickable.
- Confirm successful create closes the dialog and shows a toast for about
  `3000ms`.
- Confirm status filter and date sort produce matching visible table results.
- Confirm mobile layout does not overflow.
