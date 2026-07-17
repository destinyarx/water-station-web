## Goal
- Improve dashboard UI/UX 
- Fixed some bugs outside the dashboard (deliveries)
- Update all dashboard UI/UX


## Dashboard issues/improvements
1. The stats card design is good, retain the design for `DELIVERY SALES`, but fir the other stats card `PENDING DELIVERIES`, `COMPLETED DELIVERIES`, and `REFILL UNITS` should follow the `Customers` stats card design that has a water animation below the card like a wave. you can reuse that card styles but make sure to retain the deisgn of `DELIVERY SALES` stats card.
2. Remove this in the stats card: 
   ```
    New activity vs yesterday
    New activity vs last week
    New activity vs last month
   ```

   - Instead it should be in percentage:
   - If the coverage is `Today`, add percentage if stats versus yesterday
   - If the coverage is `Yesterday`, add percentage if stats versus today
   - If the coverage is not `Today` and `Yesterday` do not add or display any stats percentage comparison and just display the stats card as it is.
   - Sample in delivery sales: `20% more sales today than yesterday`
   - In pending deliveries : ** DONT ADD ANY PERCENTAGE COMPARISON ** Display data as it is
   - In completed deliveries: `30% more deliveries today than yesterday`
   - In refill units: `10% more refill units today than yesterday`
  
3. in chart of `Sales versus expenses` add its own coverage option. To save space you can just put it in the top right in the same row of the title `Sales versus expenses` it should be a dropdown select and its default coverage is `Weekly`. Changing the coverage should only affect the `Sales versus expenses` and not the other charts.
   - The data display for coverage 'monthly` should only show the whole month expenses vs sales, instead of just displaying the sales & expenses every date for the whole month.
   
4. In `Low Stock`  and `Maintenance due` cards sure to improve. The placement for the button `Products` and `Maintenance` is not good, it should be at the top right and it should be a button. Make sure to follow good UI/UX hierarchy for card display. Also make the title of the card in anme case uppercase the first letter of the words.

5. Delivery module:
  - Issue: I can cancel a specific deliveries (table `deliveries`), the expected behavior should be:
    1. When a specific deliveries is in pending or in_progress state, i can cancel it.
    2. When i cancel it It should triger a form to fill in the reason for cancellation and then it should be saved in the database.
    3. Then the confirmation for cancelling the delivery will show `Keep delivery` and  `Cancel delivery`. (retain this) but the Cancel delivery button is disabled thus i cant cancel the delivery schedule
    4. Take note that cancelling a delivery schedule will only cancel the specific delivery schedule on the exact date but not the future delivery schedules as well as the parent delivery schedules (t)
  - Improvement: 
    - Add a confirmation when updating the deliveries status, make sure the content of the toast confirmation match the status you wnat to update and add some details (this should `From records` and `guests` details like name and what you think vital information should be display a slogn as you dont bloat too much information of the toast confirmation). Use the global components for this check the `src\components\app`
    - In the delivery form, make the `Custom dates` calendar picker to pop-up calendar since it is too big and i need to scroll down to see more moths so just make it pop-up, but retain in the form the display `${number} dates selected`.
   