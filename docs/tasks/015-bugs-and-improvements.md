## Status: Implemented — migration application and signed-in manual QA pending


## Bugs
1. Deliveries Module
   - **Recurring schedule queue visibility follow-up (2026-07-18):**
     - Stopping a recurring schedule hides all of that schedule's occurrences
       from the main delivery table.
     - Resuming it shows eligible pending/in-progress occurrences again.
     - Stop/Resume never mutates completed, cancelled, or failed occurrences.
   - **Atomic Stop follow-up (2026-07-18):**
     - Stop now calls one security-invoker database function instead of two
       independently committed SDK updates.
     - If eligible occurrence archival fails, the schedule status change rolls
       back instead of displaying an error for an already-paused schedule.
     - Canonical migration:
       `20260718183000_pause_delivery_schedule_atomic.sql` in the sibling
       Supabase repository; application and signed-in QA remain manual.

   1. Stopping a delivery schedules in `Recurring schedules` returns an RLS error:
   ```
    {
        "code": "42501",
        "details": null,
        "hint": null,
        "message": "new row violates row-level security policy for table \"deliveries\""
    }
   
   ```

   Context: I am currently using an `owner` account so i can stop/resume the delivery schedules as long as it belong to my organizations.
   Target behavior should be: 
   - Stopping a delivery schedule should not return an RLS error.
   - Only the `owners` and the staff which match the `creator` (`created_by`) should be the one who can stop/resume a delivery.
   - If i am using a staff account, for the delivery schedules that I am not the creator action for `stop/resume` should not show, and it should have an indicator or label (its up to you as long as it is easily distinguishable in the UI that i cant perform that action, i should not see and be able to click the button).
  
   2. `Recurring schedules` module
   - Add a serchfield so user can type the name of the customer to quickly find or filter the list of customers.
   - Add or display important details such as customer names.
   - Delivery schedules should have a serchfield and a filter for `Active` and `Inactive`.
   - It should also have a filter for `Business` and `Household`
   - Make sure to increase the modal width and display the data in a more refined UI/UX (datatable is not look good, change it to the current design system, increase the width and follow the proper hierarchy). Make sure that the text and record is clean, professional looking and easily readable.
   - The data for `Next` is always none check if it is correct and add the display for `current`. The `Current` should display the delivery scheduled date for the `pending` that the schedule date is today or previous date. If the `current` has record dont display it and rather display the `next`. the `next` display the scheduled date that is in the future dates. If there is no schedule date to display for `Current` or `Next` display appropriate labels. (Its up to you) as long as it follows the design system as well as the main theme for the system. Also make sure that the `Recurring schedules`  table is not fetching the whole records make sure to use limit or offset to paginate the data. Find ways to efficiently know if there is a next page of the table wiothout sacrificing large unecesarry records fetching.
   -  Also improved the display of the datatable as it not looks good. For the delivery items make sure to properly display the product name, and quantity (including the unit of measurement) and follow the current design system as well as proper design hierarchy.
   -  Increase modal width size and add right padding so scroll in the modal right side is not tooclose on the element inside the modal.


   1. `Delivery history` - the datatable row arrangement should be based on the the `datetime`. I noticed that the `cancelled` delivery history is not on the chronological order and is displayed on the last row. Follow the order of datetime and make sure it is server-side (instead of fetching all delivery histories all ot once). Also improved the display of the datatable as it not looks good. For the delivery items make sure to properly display the product name, and quantity (including the unit of measurement) and follow the current design system as well as proper design hierarchy.
   -  It should also have a filter for `Completed`, `Failed` and `Cancelled`.
   -  For the delivery items, it can be in accordian or any collapsible so history datatable will not be bloated its height and the customer will just click it to see the delivery items. It is up to you what the deisgn should be but make it modern style but clean looking perfect for the management system. 
   -  Also make sure that the `Delivery history`  table is not fetching the whole records make sure to use limit or offset to paginate the data. Find ways to efficiently know if there is a next page of the table wiothout sacrificing large unecesarry records fetching. 
   - File included: `src\features\deliveries\components\delivery-history-dialog.tsx`

## UI/UX 
- Tailwind refactor
  - Rule: Strict — only refactor files that you already opened for a listed fix. 
  - Plain css should be refactor into tailwind css.
  - Make sure that refactoring it into tailwind css does not change the styling.
  - (do not refactor files that you just scanned but do not need to re-code because it is not in the scope of tasks listed above)
