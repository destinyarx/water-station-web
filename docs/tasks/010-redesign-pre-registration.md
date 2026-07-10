## Status - [DONE]

## Goal
- Redesign the complete-registration page 
- Make sure that it follows `docs/DESIGN.md` and compliments the design of the landing page


## UI/UX
- You should follow the `docs\DESIGN.md` when designing the UI and you can also make the landing page as your inspiration of thow should the complete-registration should look like.
- You can add a pleasing to the eyes background gradient, maybe something that is related to ocean as well as blue sky that is pastel sky blue or ocean blue gradient to white. Since the app is about the `Water Station`, try to use ocean/blue/water related colors in the design.
- You can make it a modern complete-registration form page but make sure to still conforms to the theme and design guidleines.
- It should follow the dark/light mode designs.
- See the ADR for the dark/light mode - `docs\adr\0004-dark-mode-scoped-to-three-surfaces.md`
- Dark mode toggle should also add in the top right, the same location of the darkmode toggle in the landing page.
- The complete-registration page should also be responsive and should work on both mobile and desktop devices.
- Make sure that the complete-registration page is accessible and follows the WCAG guidelines. 
- When calling the name of the user in the label, you should use the session claims for name, i put it in the publicMetadata in the clerk session claim `name`.
- Make sure to follow UI/UX guidelines hierarchy.

## Contraint
- Do not change the fields, data, form or any logic for the complete-registration.
- Only change the UI/UX design.
- Maintain the toggle for Owner and Staff as i like it. (But still you can imporve the overall design)
- Do not change any submit logic code, the only thing you will change is the design.
- 

## Files
- `src\app\complete-registration\page.tsx`
- `src\components\layout\app-header.tsx` - line 82 for the light-dark mode toggle button.
- `src\features\registration\components\complete-registration-form.tsx` for form component
- 