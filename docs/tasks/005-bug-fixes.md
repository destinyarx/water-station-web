## Status - [DONE]

## Goal
- Fixed all the bugs listed in the issues section below.
- Make sure that behavior is not affected and fixed properly, no regression.

## Issues to fix
1. [HIGH] Editting a products trigger and issue, listed below:
    - File related:
      - `src\features\products\components\product-form.tsx`
      - `src\features\products\components\products-table.tsx`
      - `src\features\products\hooks\use-update-product.ts`
    -error:
    [browser] Uncaught TypeError: value.trim is not a function
    at numberSetValueAs (file://C:/Users/AlphaQuadrant/Documents/0 self project/Agent Projects/water-station-web/.next/dev/static/chunks/src_11neqp9._.js:800:45)
    at getFieldValueAs (file://C:/Users/AlphaQuadrant/Documents/0 self project/Agent Projects/water-station-web/.next/dev/static/chunks/node_modules_react-hook-form_dist_index_esm_mjs_0b0kr13._.js:1124:240)
    at setFieldValue (file://C:/Users/AlphaQuadrant/Documents/0 self project/Agent Projects/water-station-web/.next/dev/static/chunks/node_modules_react-hook-form_dist_index_esm_mjs_0b0kr13._.js:1821:68)
    at updateValidAndValue (file://C:/Users/AlphaQuadrant/Documents/0 self project/Agent Projects/water-station-web/.next/dev/static/chunks/node_modules_react-hook-form_dist_index_esm_mjs_0b0kr13._.js:1611:182)
    at ref (file://C:/Users/AlphaQuadrant/Documents/0 self project/Agent Projects/water-station-web/.next/dev/static/chunks/node_modules_react-hook-form_dist_index_esm_mjs_0b0kr13._.js:2269:21)
    at commitAttachRef (file://C:/Users/AlphaQuadrant/Documents/0 self project/Agent Projects/water-station-web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js:7354:63)   
    at runWithFiberInDEV (file://C:/Users/AlphaQuadrant/Documents/0 self project/Agent Projects/water-station-web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js:965:74)  
    at safelyAttachRef (file://C:/Users/AlphaQuadrant/Documents/0 self project/Agent Projects/water-station-web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js:7364:13)   
    at commitLayoutEffectOnFiber (file://C:/Users/AlphaQuadrant/Documents/0 self project/Agent Projects/water-station-web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js:7904:32)
2. [HIGH] For the data row that is in the last part of the datatable, when i clicked the action button the action popup is overlap by the datatable footer making it the action option not clickable.
   - Possible fix: make the z-index of the popup action option greater than the datatable footer/ border.
   - Files included:
     - `src\features\customers\components\customers-table.tsx`
     - `src\features\expenses\components\expenses-table.tsx`
     - 
   
3. [HIGH] Add datatable pagination to products and maintenances. Make each of the table fixed to 10 items per page, with the button fixed on the bottom right (Check the customers and expenses datatable). I want it to be consistent unless it needs a custom design (like in the products table). 
    - Files included:
      - `src\features\products\components\products-table.tsx`
      - `src\features\maintenance\components\maintenances-table.tsx`
   
4. [MEDIUM] Can you make the card stats height on the expenses module a little bit less to add a room for the tables data below. My concern is when page loads the user needs to scroll to see the record. I want it to retain the design and adjust spacing, gaps , and padding while still retaining the style to add more height space. Also follow UI/UX hierarchy so fotn-size will also adjust accoridng to the height and remaining space.
    - File included:
      - `src\features\expenses\components\expenses-page.tsx`
      - on line 44-95 (StatCard Component)
