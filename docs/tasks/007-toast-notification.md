## Status - [DONE]

## Goal 
- Create a reusable toast notification for success, error, warning, and info
- Put it in the global shared components for easy access and usage
- It should be positioned at the top-right corner of the screen
- It should accept props for customizeable message, type, duration, and auto-close feature
- The toast should have a slide animation from the top to the bottom and vice versa, it should be smooth and not jarring to the eyes.
- It should be easily useable from the other apps and make sure it can be used in any condition (using async functions or not)

## Design
- Use the existing button styles for colors and rounded corners
- Use the existing font styles for text
- Check the current design system specially the `docs/DESIGN.md`
- You can use shadcn-ui toast notification if already present in the project if not you can just create a native react toast as long as it function as a toast.

## Initial integration
- use the toast in maintenance module and make sure it is working properly
- Use it in complete task and also in the create/update task action.
