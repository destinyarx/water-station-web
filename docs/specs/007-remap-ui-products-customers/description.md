## Goal:
1. Rebuild UI deisgn of products module and customer module based on the html file i attach.
2. Make sure to still rebuild it in react and tailwind css derived from the UI design fo the html files.
3. Make sure the cards, colors, buttons, etc correctly copy based on the html files while still maintaining clean code principles in the react app. For simple things you can use KISS principle (Keep it simple).
4. Make sure to follow the lgith and dark mode. This is t=done in the previous session you can as weel check `docs\adr\0004-dark-mode-scoped-to-three-surfaces.md`.
5. If theres a mismatch for forms fields, data columsn etc or mising data things from the html file make sure to just adapt the UI design fo the attached html files but still maintaing the logic flow, backedn, data forms & rows etc.
6. Sidebar and the dark mode is already done from the previous session so you can just reuse it.
   
## Files
- for customers - `docs\specs\007-remap-ui-products-customers\AquaFlow Customers.html`
- for products - `docs\specs\007-remap-ui-products-customers\AquaFlow Products.html`

## Constraints
- build the UI exactly like in the attach claude design file. if ever theres need an adjustment like sample the data,  the forms inside the fields datatable columns etc. * make sure to match my current data, field , forms, columns, forms, data types, etc,, to the new UI.
- Adjust the UI/UX design only, the ui of landing page, sidebar, expenses, i dont want you to manipulate the backend, api, db, types, etc.. * except the expenses ui and types, forms, columns, data types etc..
- Make sure that the scope is only in Landing page, sidebar, and expenses module.
- Make sure to follow the clean code principles, typescript, tailwindcss.
- Update the `docs/DESIGN.md` to match the design system of the attach html files build by claude design.
- Make sure to add clerk authentication integration for the login and register buttons in the landing page.
- all files or markdown produce by the /skills i used should only be created inside the cuirrent working path except for the ADR which should be put here  `docs\adr`