## Pre-requirements

- Before starting anything read first the files:
  1. docs\specs\004-deliveries-module\HANDOFF-2026-06-16.md - handoff file from previous AI agent
  2. docs\specs\004-deliveries-module\issues - issues that the previous agent worked on and completed based on this HANDOFF-2026-06-16.md
  3. docs\specs\004-deliveries-module\ACCEPTANCE.md - previous acceptance criteria.
  4. docs\specs\004-deliveries-module\004-deliveries-schema.md - table schema

## Important
- make sure to clearly defined, grill the delivery part.
- If theres a need to cchange the schema create a migration script it hsould be in PostgreSql (dont move to testing phase or implementation phase, You should create a schema scription in this folder. and create new issue for implementation and testing.)
- Since it should have a 
  - not recurring delivery schedule (one time):
    - sample, I added a one time delivery for customer Juan Luna for future or today date only, sample next week June 28 and July 7 i schedule a delivery for him. (This can also be applicable to guest / non-existing customers)
  - scheduled (recurring schedule record) sample:
    - I added a recurrent schedule for customer with existing or non-existing customers. example: I added a 2 x a week delivery for customer Juan Luna (every tuesday and thursday)
  -  current delivery schedule (this is the current active recurring schedule date for customers)
     -  sample, for recurring delivery schedule is every tuesday and thursday for Juan Luna. but the current date is already wednesday. so the current delivery schedule should be just Thursday, then it should display that with initial `pending` status that i can change to `for_delivery`.
- Check the 3 datatables that i will mention in the task description. (check this whole markdown file for the context) It is:
    1. Main Datatable for current schedule deliveries
    2. Delivery History datatable
    3. Scheduled Delivery table (it should be the parent and not the scheduled delivery with date)


## Task Description

Continue the work on the deliveries module. What i want it is:
1. Check the issues 004 - 008 in folder `docs\specs\004-deliveries-module\issues` to see what the previous agent worked on and completed and if what was left. if the issues is not yet completed or done then continue that but the working folder should be here now:
    `docs\specs\005-deliveries-module-continuation`


2. Im thinking of this display and hierarchy:
    - Main deliveries page is displaying the current delivery that is scheduled (pending or for_delivery)
    - Theres in the left side (flex) of 'New Delivery', Add the new button
        - `button to see all deliveries history ('pending or failed deliveries in history')` when i clicked it it should display the modal inside that modal is the datatable for those history
        - `button to see main delivery reccurrent list` - the main delivery list is likie the parent for example, i added a recurrent delivery for guest or customer it should display there, it can be updated (in the future, this is not yet for now) but i should also stop the delivery schedule. (If i stop the delivery it should stop for all including the future delivery schedule).
        But you should think a way when i continue it again all delivery should still continue (make sure to take note the current date, since i can stop the delivery at this date, then in the next 4 weeks I set the recurrent delivery to active again.)

3. fdgdgDatag
4. sfdfdgf
   
5. Build or implement the feature for updating the pending delivery:
  - add action for updating the status of the delivery (Dtatable in the main pages for 'pending' and 'for_delivery')
  - Once the delivery is under pending or  a user can changed its status:
    - `pending -> for_delivery`
    - `pending -> failed` // so user can stop (stoping the delivery recurring schedule) or cancel the current schedule (but not the stopping the next schedule if it is recurring delivery) the delivery even it is not yet in status 'for_delivery'
    - `for_delivery -> completed`
    - `for_delivery -> failed`
    - terminal `completed`/`failed`

6. Changing delivery status:
  - owner and staff can both changed the delivery status as long as it is within the org_id.
  - affect the stock (if the product stock is tracked), but willl only fully reflect if the status is completed
  - should also update the other deliveries related tables, check 004-deliveries-schema.md to see the related tables 
    - main deliveries table
    - recurring delivery schedule
    - delivery items that is included in the transaction
  
  
7. Seperate datatable for completed and failed deliveries
  - Remove the `failed` and `completed` deliveries in the current deivery.
  - You can add a button to show a modal, inside that modal is the datatable for completed and pending deliveries.
  - the completed and failed deliveries is no longer editable, only the status can be changed to pending or for_delivery (which will make it editable again)
  - for completed make sure it is easiy distinguish as completed, and failed () and display the notes sample for failed it has notes (if notes is not null then display it). 
  - 

8. Datatable changes:
   - make it server side (utilize offset, limit) so supabase sdk query can make it still possible to have a next, and prev.
   - Think of a scalable way to know the last item in the table. Since it is excessive to fetch all just to know the total data.
   - I am thinking of fetching the current total items + 1 to check if theres still data next. But make sure to remove or pop the excess data when displaying to UI.
   - Implement the server side pagination like in all datatable of deliveries module.
   - Make sure that there will be three datatables after this 
     - main datatable in the landing page (for `pending`, `for_delivery` deliveries)
     - when i click history button , it will display modal with table inside showing the 'failed' and 'completed' deliveries
     - `main delivery reccurrent list` stated in #2, when i clicked it it should display modals with datatable inside showing the main delivery recurrent schedule, display relevant details, and the only action is to stop the recurring schedule for delivery.
  
  
9.  Datatable
  - Make the date, status, and total width fit perfectly the content since it is only a little compare to other column to save space.
  - Pagination for next and previous.
  - Make sure that the UI/UX design is clean and professional looking taht fits as water refilling station maagement system.
  - icon for products (track stock icon should be different form non stock product to easily identify it).

10. UI changes 
    - for cards on top `Active Deliveries`, `Pending` and `Reference Data`
    - Change the style make it more cleaner llok check for balance UI/UX in card and guidelines. The space and uneven layout is not good. The icon is not balance with the title and label, and it should be different from ech other.
    - Remove 'reference data' and replace it with 'Completed deliveries' display the number of completed deliveries for the day.
    - The same with 'Active deliveries' i wnat it to be the count of deliveries for today (pending) if the status of a pending -> for_delivery it should decrease, and its scope is only for today so change the label or anything that will make the user easy to distinguish it is for today. the same with Completed deliveries.
    - For pending deliveries, keep it as previous date up to now, so user can see if there still pending deliveries from the previous days. (Check for improvements since if the date, and data is too many just extract 7 days ago until today if its too much data).
    - Add icon for the status and sort filter make sure the icon will compliment the UI style as well as easily distinguish what kind of filter it is.

