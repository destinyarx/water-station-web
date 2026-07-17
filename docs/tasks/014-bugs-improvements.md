## Goal
- Fix the issues and improvements i listed below.
- Make sure to test and ensure not to break functionalities.
- When building components and elements make sure to follow the  current design system `docs/DESIGN.md`

## Tasks

### Improvements
1. In module `Maintenance`:
   -  In the maintenance datatable add an action for cancel task. Cancelling a task should set its status to `cancelled` and move it to the Histories modal datatable. Cancelling a task will continue the future occurences and will just set the status of the specific maintenance tasks status to `cancelled`.
   -  Make the `Complete` action in the datatable tasks to green color shade again. Make sure it will compliment the light and the dark mode.
   -  Improve the content design UI/UX of the `histories` datatable. Make sure to check hierarchy for better label and improving the readability of the content display of the datatable row.
2. In module `Customers`:
    - Add `Inactive` filter to the customers datatable. when toggle or selected display all `Inactive` customers.
    - Selecting filter `All` should exclude the `Inactive` customers from the lists.
    - Make the row or table data of the `Inactive` customers easily distinguishable that it is inactive state. Either by the color or the icon its up to you.
    

### Issues
1. `Products Module`
   - Clicking discontinued action to a product returns an 403 Forbidden error. You can see migration `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\water-station-supabase\supabase\migrations\20260715053252_shared_operation_queue_rls.sql` if there is something wrong in the migration that can cause this.
2. `Customers Module`
   - clicking action `Archive Customer` throw an error (might be related to RLS policies) my repo for my migration `C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\water-station-supabase\supabase\migrations`
3. Overall, please investigate deeply the actions for `Archieving`, `Discontinuing`, and `Delete`. I think there are misconfiguration in the RLS policies. That causing this issue. My current account i am using is `staff` and i am executing those action in my own records so it should not throw an error either `403 Forbidden` or RLS policies, since this action is allowed to `staff` for their own records. For the `owner` they can do anything as long as their `org_id` match the modules record in the database.
4. Once the issue for archieving, deleting, setting inactive of certain records is fixed. Make sure to check the documents module. When archieving a record can you please delete the file in my supabase stroage bucket and unlinked the url or connectoon of the saved file from my database to bucket. (The reason is to save storage, you can rename the `archieve` to `delete` so it is reasonable). Also in the `Documents` datatable please remove the `Private` filters as `All Staff` refers to 'All' filter and `Only Me` refers to `Mine`. BUt rename the `Mine` to `Only Me` as filter name. Make sure that the functionality for this two remaining filter is working correctly.


## UI/UX 
- Tailwind refactor
  - Rule: Strict — only refactor files that you already opened for a listed fix. 
  - Plain css should be refactor into tailwind css.
  - Make sure that refactoring it into tailwind css does not change the styling.
  - (do not refactor files that you just scanned but do not need to re-code because it is not in the scope of tasks listed above)