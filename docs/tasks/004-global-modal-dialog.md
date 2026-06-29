## Problem
### Modal
- The current following features/modules, each have their own modal even if is just a similar structure, design and a button. 
- This make it have more duplication in code instead of just creating a global dialog component that can pass a:
  - icon
  - title
  - description
  - It should have a slot so i can just <Modal>children here...</Modal>
  - modal size - (its up to you sm, md, lg, xl, 2xl, 3xl and so on...)

### confirmation Dialog
- this dialog is used when confirming a create, update, delete, archieve, make inactive etc action so it will be a confirmation dialog.
- similar to modal, the confirm dialog has many duplicate files it should a global confirmation dialog where in it has a default cancel and confirm button and a event trigger if i click the confirm button. Cancel should always remove the dialog popup.

### Notes
- The codes is alrrady done so the features already has its own modal and confirm dialog, you will just make a global one to remove repition and suplicate codes that do the same component and logic.
- Make sure to make it developer friendly but still fiollowing the coding convent set in the AGENTS.md
- Developer friendly sample is like int he components library wheere i can easily call a component and use it.


## Goal
### For Modal:
  - Create a global modal component that can be used by all the features/modules in the application.
  - It should have a slot so i can just <Modal>children here...</Modal>
  - It should have a title and description property.
  - It should have a icon props.
  - it should have an iconColor props.
  - It should have a button props.
  - The close and submit button can be customizeable, I can use the default cancel and submit button, but i can also pass my own button, if i pass my own button that will be the new cancel and submit and the default cancel and submit will not be shown.
  - It should have a close and submit trigger so when i resue it i can just have a event trigger like:
   - @onSubmit(values: T) => void
   - @onClose() => void 

#### confirmation dialog:
- I should also make a props so i can pass:
  - icon
  - icon-color props.
  - title
  - description (make this pass an html for custimizeable description)
  - dialog size (make sure to check the approate variation for a confirmation dialog)
  - Confirm button (custom label and button color in hex code sample: #00000)
  - if i dont like the default dialog, i should be able to pass a custom cancel and confirm button

## Resolved Decisions

- The global modal is a presentational shell only. Feature forms, validation, TanStack Query mutations, and domain behavior stay inside their feature modules.
- The shared modal component is `src/components/app/app-modal.tsx`. It owns the overlay, header, icon slot, size/max-width, close button, Escape close, body slot, and optional footer slot.
- The shared confirmation component is the existing `src/components/app/confirm-dialog.tsx`, extended in place instead of creating a second confirm dialog.
- `ConfirmDialog` defaults to the primary blue gradient action used by the app's form submit and create buttons.
- Archive/delete confirmations explicitly use `variant="destructive"` to retain the red destructive treatment.
- Confirmation descriptions use `React.ReactNode`, not raw HTML strings. This allows rich content such as `<strong>` while avoiding `dangerouslySetInnerHTML`.
- `ConfirmDialog` supports semantic variants first, with `confirmButtonStyle` as an escape hatch for uncommon custom button styling.

## Constraint
- This affected features/modules scope is: Customers, Products, Maintenance, Document, and Expenses only.
- Dont touch other module except to the scope i stated in the first contraint.
- Make sure that current UI/UX design of the modal must be retained, dont change the design.
- For documents, the modal header is slightly different, in this you can just make it similar to the other features/modules since only a global modal will be created but make sure i can pass a different icon, title, and description.
- Make sure to use tailwind css in this.
- Make sure to first, use the same styling and UI i wnat it to be almost equal to whats in the current state you can make some modification but make sure that the original touch of styles etc is stilll retain.
- Make sure that the modal is responsive and works on different screen sizes.

## Files 
- If you find a file that i didnt mention here feel free to modify, delete (if its is a duplicate modal or dialog)
- Just make sure it is within the scope
- I will attach the files in the thread chat.
