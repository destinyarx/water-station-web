## Goal:
- Build maintenance module with the ui design of the attach html files `docs\specs\008-build-maintenance-module\AquaFlow Maintenance.html`.
- Make sure to check the behavior, constraint below to catch anything that is not within the html files attach.
- For the dark mode already present in the project you can use this ADR `docs\adr\0005-record-status-distinct-from-archive.md`
- Build a migration file 'postgresql' from the maintenance module should be save inside the working directory `docs\specs\008-build-maintenance-module` and maned it `maintenance_migration.md`.



## Business Related 
- Make sure to reserach water refilling station business and mix that with the current html file to arrived on what are these modules should have like the equipment type or should i have add a others option, just add a notes for this so user can describe clearly.
- The users staff to assigned_to should be within our organization only, table users with the org_id match with our current user's org_id.
- Business logic is the key in this module so make sure to analyze and verify the real water refilling station maintenance schedule etc.

## Behavior:
- As a user i can create, update, delete and set to (inactive or what status should it represent clearly) a maintenance schedule
- Maintenance schedule should allow a recurrent schedule or a custom one time schedule (a calendar pop-up that i can select multiple dates as the schedule dates) - use library if needed to make it easier.
- For inactive status you should not include it in the datatable, except if user ticks the `show inactive` button or something that can show inactive maintenance schedule. 
- For the table i am thinking of having a parent maintenance schedules then the actual schedules, sample I should be easily see the main parent schedule i created so i can easily set it to inactive.
- It should have a status like active, inactive, completed (if the schedule is already done and no pending schedules are left).
- Its up to you how you can compe up with the table relations just make sure it is clean and no too overcomplicated as long as it satisfy the behavior and condition. (At least two tables or its up to you).
- The label for upcoming schedules it should only display (In ${n} day) if it is 3 days from the current date. for upcoming tommorow just add 'Tomorrow'.
- For the recurrent schedules dont add the 'every 6 months', quarteryly and yearly. That is not needed. For weekly you should include thwe once, twice, thrice and a user can select what days of the week should it be (Mon - sunday selection) (that is applicable only for the weekly schedules)
- You should also include the everyday schedule.

 

## Design 
- Make sure to follow the design in `docs\specs\008-build-maintenance-module\AquaFlow Maintenance.html`
- If the design does not match the specs make sure to adjust the design so the behavior and data in the table and forms will still be followed and only the design will adjust.
- dark mode is already implemented in my app so make sure to follow the dark mode design in the html file and in the ADR docs `docs\adr\0005-record-status-distinct-from-archive.md`.

## Constraints:
- build the UI exactly like in the attach claude design file. if ever theres need an adjustment like sample the data,  the forms inside the fields datatable columns etc. * make sure to match my current data, field , forms, columns, forms, data types, etc,, to the new UI.
- Make sure that the scope is only limited in maintenance module.
- Make sure to follow the clean code principles, typescript, tailwindcss.
- Update the `docs/DESIGN.md` to match the design system of the attach html files build by claude design.
- all files or markdown produce by the /skills i used should only be created inside the cuirrent working path except for the ADR which should be put here  `docs\adr`.