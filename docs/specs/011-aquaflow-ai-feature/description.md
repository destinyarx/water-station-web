## Goal
- Build the aquaflow ai assistant for water station management.
- It should helped the business owner to gathe rinteligent insights and decision that is tailored and build specially for the water refilling station busineses.
- Make sure to use the claude code design html file i attach here `docs\specs\011-aquaflow-ai-feature\AquaFlow AI Assistant.html`


## Specs
- Use modern day way of building AI chat agent or AI chatbot using my current tech stack..
- I plan to use supabase edge function deployed with gemini model here since gemini has a free tier for its API key, so all of the ai agent call willl be a supabase edge function URL.
- For now check if there is just a dummy or placeholder url that i can use so i will first just build the UI and its functionality before connecting my supabase edge fucntion url.
- I am planning to use supabase edge function so i will just call my supabase edge function url to make a call to the GEMINI API.
- The prompt is crucial here, so i need the prompt to be understand by AI as well prompt should be tailored to the business (Water refilling station)
- For the tRY Asking or the ready made prompt on the left side of the chat:
  - I want you to polished that to a more in depth prompt that hsould help business owner for a mineral water refilling station to have insights, meaningful info, pattern, etc ready made prompt that will help them for decision making.
  - Create a title or simple prompt title for that and display the title on the left side as well for each ready made prompt.
  - example title: "Analize my sales"
  - exact prompt: `this is just a dummy prompt...Make it around 5-10 ready made prompts. make it in such a way that it should help the bu.......`
  - Make sure that the prompt can be understand by the LLM models and is based on prompt engineering specilized in gathering and analyzing data pattern and etc.
  - Make sure that the prompt is tailored for water refilling station business.

## Constraint
- build the UI exactly like in the attach claude design file.
- It should be a react + tailwind css avoid plain css when converting the html design to my module in the app. Just use the css and etc if there is no way this could be recreated in react + tailwind css.
- Make sure that the scope is only limited in aquaflow AI module.
- Make sure to follow the clean code principles, typescript, tailwindcss.
- Update the `docs/DESIGN.md` to match the design system of the attach html files build by claude design.
- all files or markdown produce by the /skills i used should only be created inside the cuirrent working path except for the ADR which should be put here  `docs\adr`.