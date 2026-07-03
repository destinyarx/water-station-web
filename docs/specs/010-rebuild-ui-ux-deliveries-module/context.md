## Role
- You are a senior React frontend developer that specialize in turning html prototype to a working production ready UI.
- You are also an expert in mapping a new UI design to an old UI project to improve the UI/UX.

## Context
- Remap and rebuild the UI/UX of the deliveries module, you should not modify and changes functionality i just want you to remap and reapply the new design system.
- The order of hierarchy is this i want you to map the UI design of this html file `docs\specs\010-rebuild-ui-ux-deliveries-module\Deliveries.dc.html` into the current UI design of current deliveries page in the project.
- The goal is to copy exactly the design of the html file but make sure it is in React and tailwind css.
- Files included:
  - ADR (this might help you to grasp the behavior of the delivery module)
    - deliveries entity - `docs\adr\0002-deliveries-two-entity-rolling-materialization.md`
    - for dark mode - `docs\adr\0004-dark-mode-scoped-to-three-surfaces.md` 
  - Deliveries Ui and modules
    - main page - `src\app\(protected)\deliveries\page.tsx`
    - deliveries components here - `src\features\customers\components`
    - hooks (just neede but the goal is to remap/redesign the UI only not the funcitonality) - `src\features\customers\hooks`

## Goal
- Remap or use the html file to redesign the current UI of my deliveries module.
- Maintain the current functionality of the deliveries module where it does not conflict with the HTML form baseline.
- Delivery behavior and schema may be reopened when required to make the current module follow the HTML form's baseline interaction model.
- Make sure it is in React and tailwind css.
- Make sure it is responsive.
- Some design dont match like in my current it has buttons for:
  - History
  - Schedules
  - New Schedule (button for adding new schedule) (not in html but im thinking of removing this and follow the html format of form)
  - New Delivery (button for adding a one time delivery)
- Form fields, data, and anything should stay BUT I want to remove the New schedule and follow the html way of:
  - In thml (weekly or recurring delivery + one time delivery is combined into one form modal)
  - I want the same design and approach of the form in the html file (the form modal) - check if you followed this approach in form is there complication in the logic specially in my delivery hooks and service code found here `src\features\customers\services\customers.service.ts`

## HTML vs. Current Deliveries Module
1. Button
   1. Follow my current but if applicable (or you find a way so service and logic flow still feasible to fix) remove the `New Schedule` button and follow the html approach (combine delivery + new schedule). Since it is also equivalent in html to `Recurring Route` and `Custom Delivery`.
   2. Retain buttons for 'History' and `Schedules`.
2. Form
   1. The html form has a assigned_to field, make it also and modify the logic since i also needed that
   2. In my current form, it has delivery target (Guest and existing customer), that is just the same with the html `From records` and `Guest` toggle button.
3. in html, it has a toggle state:
   1. Recurring Route - in my current delivery form and logic this is equivalent to `Weekly Schedule` or Adding a weekly schedule
   2. Custom Dates - in my current delivery form and logic this is equivalent to one time delivery (I need to allow multiple dates for improvements)
4. For the delivery items - i want a searchable dropdown select so i can easily serach if the items is too many.
5. Overall i am in favor of the html for the design and form structure. You can check and plan extensively to check the modification needed.
6. If there is need to modify behavior and logic, and needs a igration create a migration file for postgresql inside this working directory.

## Workflow
- Read the ADR files to understand the bahavior and logic of the deliveries module.
- Read the current deliveries page and components to understand the current implementation.
- Read the html file to understand the new design system.
- Read the services and hooks to understand the current implementation.
- Read the current `docs/DESIGN.md` since that is also updated to the design system of the html file.
- Map the new design system to the current implementation.
- Plan the migration/reimplementation of the design system.
- Execute the migration/reimplementation.
- Test the implementation to ensure it works as expected and test for any errors.
- Document the changes made.

## Deliverables
- A revised UI design based mainly on the html file i provided.
- I want a almost identical to the html file design, unless for the some differences in terms of dsome buttons that i should retain but i wnat you to also modify ts deisgn to adapt to a new design system.

## Resolved decisions from grilling

- Feature 010 is not limited to a visual-only redesign. It may change delivery behavior, services, hooks, validation, and database schema when that is necessary to make the HTML form the baseline delivery creation experience.
- The `Schedule delivery` form in `Deliveries.dc.html` is the target baseline for the delivery creation flow, replacing the current split between `New Schedule` and `New Delivery` as the primary creation interaction.
- The current separate `History` and `Schedules` buttons remain available, but the creation entry point should move toward one unified form that can create either a recurring delivery schedule or one-time/custom dated delivery occurrences.
- The HTML form's `Custom Dates` mode should create one parent delivery plan with multiple dated delivery occurrences, all sharing the same customer/guest, item lines, notes, and assignee. It should not create multiple duplicate one-date parent schedules. This likely requires changing the existing one-time schedule model, which currently stores only one `delivery_date` on `delivery_schedules`.
- The canonical domain term remains `Delivery Schedule`. `Custom Dates` is a UI label for a non-recurring Delivery Schedule with an explicit set of selected dates. It is not a separate entity type.
- Custom-date schedules should store their selected planned dates in a child table such as `delivery_schedule_dates`, with one row per selected date. Do not store the custom dates as a `date[]` array on `delivery_schedules`.
- Add a new `delivery_recurrence_type` value, `custom_dates`, for multi-date non-recurring schedules. Keep existing `one_time` semantics as exactly one dated schedule for backward compatibility and clearer historical interpretation.
- The redesigned unified form should create `custom_dates` schedules for all non-recurring submissions, even when the user selects only one date. Existing `one_time` schedules remain readable/editable for backward compatibility but should not be the primary new creation path.
- When a `custom_dates` schedule is submitted, the system should immediately create one `pending` Delivery occurrence for each selected date. Custom dates should not wait for the 14-day rolling materialization horizon because the selected dates are explicit user intent, not generated recurrence.
- The HTML form's assignee field should be implemented as a real org staff picker backed by `public.users(clerk_id)`, stored as nullable `assigned_to`, with `Unassigned` allowed. Do not implement assignee as free text.
- Store `assigned_to` on both `delivery_schedules` and `deliveries`. On a Delivery Schedule, it is the default assignee for future occurrences. On a Delivery occurrence, it is the actual assigned staff member for that run and may be changed when the delivery is executed. Materialization should copy the schedule default into each new occurrence, while occurrence edits should not change the schedule default unless an explicit schedule-edit flow does so.
- Keep `assigned_to` distinct from `delivered_by`. `assigned_to` is editable planning/assignment data. `delivered_by` remains audit metadata auto-stamped from the acting Clerk user when an occurrence moves to `for_delivery`, and must not be manually entered in the form.
- Any organization member may set or change `assigned_to` for organization-scoped delivery schedules and occurrences. Assignment is part of the shared station queue, not an owner-only action. RLS must still ensure the chosen assignee belongs to the same organization.
- The assignee picker should include all active organization members, including owners. Small stations may assign deliveries to owners as well as staff.
- Do not add an `in_progress` delivery status. In the HTML prototype, `In progress` maps to the existing `for_delivery` status.
- Add `cancelled` as a real Delivery occurrence status. A Delivery may be cancelled only while its status is `pending` or `for_delivery`. The core lifecycle remains `pending -> for_delivery -> completed/failed`, with `cancelled` as a terminal side exit from pending or for-delivery work.
- If a Delivery is cancelled from `for_delivery`, stock-tracked items should be restored because `cancelled` is outside the stock-out window. Cancelling from `pending` should not change stock because no deduction has occurred.
- Cancelling a Delivery should require non-empty cancellation remarks. Store them in `cancellation_remarks`, require them when `status = 'cancelled'`, and collect them through a cancellation confirmation/remarks dialog similar to failed delivery remarks.

## Constraint
- build the UI exactly like in the attach claude design (html) file.
- It should be a react + tailwind css avoid plain css when converting the html design to my module in the app. Just use the css and etc if there is no way this could be recreated in react + tailwind css.
- Make sure that the scope is only limited in the deliveries module.
- Make sure to follow the clean code principles, typescript, tailwindcss.
- Update the `docs/DESIGN.md` to match the design system of the attach html files build by claude design.
- all files or markdown produce by the /skills i used should only be created inside the cuirrent working path except for the ADR which should be put here  `docs\adr`.

## Follow-up pass (2026-07-02) — dark mode + form UX fixes

The first rebuild pass (above) shipped the visual redesign but used hardcoded hex colors
throughout instead of the app's `--app-*` design tokens, so the deliveries module did not
respond to the dark mode toggle even though `customers`/`documents`/`products`/`maintenance`
already did. This pass fixed that gap and made a few form UX changes the user asked for
directly (not from the HTML file). See `docs/adr/0004-dark-mode-scoped-to-three-surfaces.md`
for the ADR amendment.

- **Dark mode**: every component under `src/features/deliveries/components/` now uses
  `var(--app-*)` tokens (see `src/app/globals.css` for the token list) instead of literal
  hex/rgba values, matching the pattern already used in `customers-page.tsx` /
  `customers-table.tsx` / `customer-form.tsx`. Fixed accent colors that aren't part of the
  token system (e.g. the amber/violet stat-card accents, the brand gradient button) are
  intentionally still hardcoded hex — that mirrors what `customers-page.tsx` does for its
  own stat card accents, so it's consistent, not an oversight.
- **Dead code removed**: `create-delivery-dialog.tsx`, `delivery-form-dialog.tsx`,
  `delivery-form.tsx`, `create-schedule-dialog.tsx`, and `schedule-form.tsx` were deleted.
  They were leftover from the pre-unified-form design and were not imported by
  `deliveries-page.tsx` or exported from the feature barrel (`index.ts`) — confirmed via
  grep before deletion. If you're looking for the old split "New Schedule" / "New Delivery"
  flow, it no longer exists; `unified-delivery-form.tsx` is the only creation form.
- **Dialogs migrated to shared shells for free dark-mode support**:
  - `cancel-delivery-dialog.tsx` and `fail-delivery-dialog.tsx` now wrap
    `@/components/app/confirm-dialog` (`ConfirmDialog`) instead of the raw shadcn `Dialog`.
    Both pass a custom `actions` node (not just `confirmLabel`) because the confirm button
    must be disabled when the remarks textarea is empty — cancellation remarks are required
    per the resolved decision above ("Cancelling a Delivery should require non-empty
    cancellation remarks"), and failure remarks follow the same UX for consistency.
  - `delivery-edit-dialog.tsx`, `delivery-history-dialog.tsx`, and `schedule-list-dialog.tsx`
    now wrap `@/components/app/app-modal` (`AppModal`) instead of the raw shadcn `Dialog`,
    matching `create-unified-delivery-dialog.tsx`.
- **Unified delivery form changes** (`unified-delivery-form.tsx`), requested directly by the
  user, not derived from the HTML file:
  - The customer `<select>` (targetType `'customer'`) now prefixes each option with
    `🏢 Business` or `🏠 Household` (from `Customer.isBusiness`) so staff can tell business vs.
    household accounts apart in the dropdown without opening the customer record.
  - In the recurring-route panel, the "Repeat every" (1 week / 2 weeks) control moved to sit
    beside the weekday chip row (flex row, `Delivery days` on the left, `Repeat every` on the
    right) instead of below it.
  - The row that used to hold "Repeat every" + "Starting from" now holds "Starting from" +
    "End date (optional)". `endDate` was already present in `unifiedDeliveryFormSchema` and
    `UNIFIED_DELIVERY_FORM_DEFAULTS` (it was validated but not rendered) — no schema or
    mutation changes were needed, only re-adding the `<input type="date" {...register('endDate')}/>`
    field to the JSX.
