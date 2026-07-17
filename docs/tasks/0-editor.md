## Goal: 
- Create me a guide/recommendations for AI agent when building my dashboard as well as the prompt


## Output: 
- Two seperate file : one is for the guide or recommendation and the other is for the prompt.

## Rules for AI agent when building my dashboard:
- Since the dashboard is query data-heavy, make sure to add suggestions or recommendations, and the AI agent should still make it efficient. Best approach and strategy.
- Make sure to follow the design system use in my app `docs/DESIGN.md`
- Always use tailwind cs sover plain css



## About My web app: 
- Water refilling station management system. 

Also my modules are the following:

1. Customers

2. Products (water refilling products and stock tracked product like mineral water bottled etc)

3. Deliveries (Water refilling products or any stock tracked products that is related to business mineral/purified water refilling station)

4. Maintenance (scheduled task)


## Dashboard content (you can add or modify as long you think it will improve my dashboard)

1. Stats card on top :
 - it should have a coverage of today, yesterday, this week, this month
 - I can choose the coverage  (set default to today)
 - When i choose the today it should display the metrics for today, yesterday (in terms of change or trend), last week (in terms of change or trend), last month (in terms of change or trend). Make sure that the month is based on the month not the 30 day period. Sample June 1 - June 30, August 1 - 31. If today is June 1 Last month should display May 1 - 31.
 - Make sure to display empty state, if there is no data to display.
 - The stats card should show: 
   - Total Sales
   - Total number of pending delivery schedules today (only display this if the coverage selected is today)
   - Total number of completed deliveries
   - total number of gallon refills (product that is in deliveries completed status that is stocked_tracked is false)
2. Sales vs expenses chart
3. Sales Mix (Refill Service vs stock track products (non-refillable products that has quantity tracked)) - this is affected by the coverage (today, yesterday, last week, etc...)
4. Top 5 selling products (This is affected by the coverage (today, yesterday, last week, etc...))
   
 



