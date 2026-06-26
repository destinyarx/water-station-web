Goal:
- Create a new design system and modify the `docs/DESIGN.md` to match the design system of the attach html files build by claude design.
- Rebuild the UI only, i want you to replicate or rebuild the attach html files from claude and turn it into a react codes, (make sure to follow clean code principles, typescript, tailwindcss, shadcn/ui(if needed only)).
- 
- Update the landing page based on the attach file `docs\specs\006-create-new-design-system-and-redesign-landing-page-expenses-ui\AquaFlow Expenses.html`. I want the landing page to be exactly like in the attach file *Take note exactly and just add some clerk redirect integrection for the login register button etc* also modify the icon i want my icon in `public\icon.png`.
- 
- Build the sidebar based on the sidebar of the expenses claude corde build `docs\specs\006-create-new-design-system-and-redesign-landing-page-expenses-ui\AquaFlow Landing Page.html`. also the attach file has a header included you should implemented that make sure it is exactly what it looks like. you should create also a new context for the sidebar so that it can be used in the app.
- Build Expenses UI based on the `docs\specs\006-create-new-design-system-and-redesign-landing-page-expenses-ui\AquaFlow Landing Page.html` file. *Here i want you tto dont manipulate backend typing etc i just want you to remap and build the UI exactly like in the attach file `docs\specs\006-create-new-design-system-and-redesign-landing-page-expenses-ui\AquaFlow Landing Page.html`* if ever theres need an adjustment like sample the data,  the forms inside the fields datatable columns etc. * make sure to match my current data, field , forms, columns, forms, data types, etc,, to the new UI.
- Make sure to also include and follow the dark mode state, for the dark/light mode state you shopuld follow the 'AGENTS.md' you can use zustand store in this just make sure to follow coding convention state in the AGENTS.md.


Constraints:
- build the UI exactly like in the attach claude design file. if ever theres need an adjustment like sample the data,  the forms inside the fields datatable columns etc. * make sure to match my current data, field , forms, columns, forms, data types, etc,, to the new UI.
- Adjust the UI/UX design only, the ui of landing page, sidebar, expenses, i dont want you to manipulate the backend, api, db, types, etc.. * except the expenses ui and types, forms, columns, data types etc..
- Make sure that the scope is only in Landing page, sidebar, and expenses module.
- Make sure to follow the clean code principles, typescript, tailwindcss, shadcn/ui(if needed only).
- Update the `docs/DESIGN.md` to match the design system of the attach html files build by claude design.
- Make sure to add clerk authentication integration for the login and register buttons in the landing page.
- all files or markdown produce by the /skills i used should only be created inside the cuirrent working path `docs\specs\005-deliveries-module-continuation`