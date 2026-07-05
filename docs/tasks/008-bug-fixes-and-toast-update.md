## Goal
- Fix the bugs and issue listed below.
- Add confirmation dialog and toast notification to some modules for every CRUD action.

## Decisions (resolved 2026-07-04)
- **Confirm dialog scope: destructive / state-change actions only.** Delete, archive, set-inactive, and maintenance task-complete get a confirm dialog. Create and update do **not** — the user already commits via the form modal's Save button; a second modal is pointless friction and not how the rest of the app behaves. Create/update just save + toast.
- **Set inactive vs set active:** the active↔inactive toggle only confirms when going **→ inactive** (a meaningful state change that hides the record from operations). Going **→ active** stays a one-click toggle. Both fire a toast.
- **Toast placement: in the mutation hook**, not in dialog/component code. Every mutation hook gets `onSuccess` (success toast) and `onError` (error toast), matching the existing maintenance pattern (`use-complete-task.ts`). This covers every caller of the hook automatically. Error toast message = `error.message`.
- **Reuse existing primitives:** `ConfirmDialog` (`src/components/app/confirm-dialog.tsx`) and the `toast` API (`src/stores/toast-store.ts`). No new components/deps.
- **Bug scope:** only bug #1 (expenses edit crash). No other bugs in this pass.

### Toast + confirm matrix
| Module | Toast on | Confirm dialog on |
|---|---|---|
| Customers | create, update, archive, set-status | archive (exists), set-inactive (add) |
| Maintenance | create✓, update✓, complete✓, delete, set-status | delete (exists), set-inactive (add) |
| Products | create, update, delete | delete (exists) |
| Expenses | create, update, delete | delete (exists) |
| Documents | create, update, delete, approve | delete (exists) |

## Bugs and Issues
- 

## Confirm Dialog 
- Reuse the global components for confirm dialog `src\components\app\confirm-dialog.tsx`
- Use the appropriate labels, icons and props as to what type of confirm dialog you will create.
- Add confirm dialog whenever you are clicking an action button or a CRUD operation.
- Add the confirm dialog in the following module:
  - Customer Module:
    - when creating, updating, deleting and set customer as inactive.
    - File included :
      - `src\features\customers\components\archive-customer-dialog.tsx`
      - `src\features\customers\components\create-customer-dialog.tsx`
      - `src\features\customers\components\customer-form.tsx`
      - `src\features\customers\hooks\use-create-customer.ts`
      - `src\features\customers\hooks\use-archive-customer.ts`
      - `src\features\customers\hooks\use-update-customer.ts`
      
  - Maintenance Module:
    - Create, update, delete, and set inactive action.
    - File included :
      - `src\features\maintenance\components\create-schedule-dialog.tsx`
      - `src\features\maintenance\components\schedule-form-dialog.tsx`
      - `src\features\maintenance\components\maintenance-table.tsx`
      - `src\features\maintenance\hooks\use-create-maintenance.ts`
      - `src\features\maintenance\hooks\use-update-maintenance.ts`
      - crawl other files for more actions
    - 
  - Products Module - for Create, Update, Delete
    - For files you can check just the related files here.. do nto check everything that is not related:
    - `src\features\maintenance\components`
    - `src\features\maintenance\hooks`
  
  - Expenses Module - for create, update and delete action
  -  For files you can check just the related files here.. do nto check everything that is not related:
    - `src\features\expenses\components`
    - `src\features\expenses\hooks`

  - Documents Module - for create, update and delete action
    -  For files you can check just the related files here.. do nto check everything that is not related:
      - `src\features\documents\components`
      - `src\features\documents\hooks`
  

## Toast Notification
- Add a success and error toast notifiaction for every action (CRUD or any action i describe here)
- Use the existing toast notification component `src\components\app\toast.tsx` or `src\components\ui\toast.tsx`
- Use appropriate label, icons as to what type of toast you should display accroding to what module and action it is.
- Make sure the toast is dismissable and has a duration time before it automatically disappears.
- Apply the toast ntoification to all modules on the top that you apply the comfirm dialog make sure that every CRUD action, set inactive (if applicable to module), task completed (maintenace module) has the toast notification for success and error.


## Bugs
1. Editting expenses record trigger an error:
    `value.trim is not a function
    src\app\(protected)\expenses\page.tsx (7:10) @ Expenses

   **Root cause:** `toFormValues` returns `amount` as a `number`, but the form's
   `numberSetValueAs` register option called `value.trim()` assuming a string.
   **Fix (`expense-form.tsx`):** `numberSetValueAs` now short-circuits when the
   value is already a number and returns `undefined` for non-string values.
   **Status:** fixed.


    5 |
    6 | export default function Expenses() {
    > 7 |   return <ExpensesPage />
        |          ^
    8 | }
    9 |