## Status - [DONE]

## Goals:
- Check if the logic of the organization logic when checking if the user already has a organization and is_owner claim in their clerk.publicmetadata
- Since i changed the RLS policies as well as added a table organization_members.
- To make sure that checking the `organization`, `org_id`, and `is_owner` is updated and correct.
- Make sure that the guards are updated and correct.
- Changed the complete-registration logic. I will add the complete-registration changes below.

## Complete Registration
### flow
1. After the user is register or sign-in, the guard  `src\features\aquaflow-ai\aquaflow-ai.guards.ts` should redirect it to `complete-registration` if `sessionClaims.organization && sessionClaims.organization.is_owner` is null or non-existing. 
2. If the user selects owner:
   1. If form is submitted: use this edge function url in supabase `https://yiguiyjnuvxrhqjyyykv.supabase.co/functions/v1/create-aquaflow-organization`:
         - Body should be like this: `{ "organization_name": "My Organization", "organization_code": "MYORG" }`
         -   {
               organization_name?: unknown
               name?: unknown
               email?: unknown
           }
       -  you should also include the Authorization: `Bearer ${token}`,
       -  email and name should come from the clerk session_claims, publicMetadata the same way you extract and get the organizations and is_owner in the current codes.
   2. After submission,  refresh the clerk session tokens and redirect it to `dashboard`.
3. If the user selects staff:
   1. If form is submitted: use this edge function url in supabase `https://yiguiyjnuvxrhqjyyykv.supabase.co/functions/v1/aquaflow-add-staff`:
         - Body should be like this: `{ "organization_name": "My Organization", "organization_code": "MYORG" }`
         -   {
                organization_code?: unknown
                name?: unknown
                email?: unknown
                contact_number?: unknown
            }
       -  you should also include the Authorization: `Bearer ${token}`,
       -  For organization_code and contact_number should came from the form, since the current complete-registration form when toggle or select the staff it has field for contact_number and organization_code.
       -  For email and name should come from the clerk session_claims, publicMetadata the same way you extract and get the organizations and is_owner in the current codes.
       -  For the staff form, remove the full name and gender as i dont need it.
    2. After submission,  refresh the clerk session tokens and redirect it to `dashboard`.
## Context
- Since i changed the schema i have now added `organization_members` but since RLS will handle it is okay so no need for it.
- My main concern is that i changed the `organizations.id` should match the foreign_key `org_id` to all tables.
- Since in the old it has a `organization_code` column that match instead of matching the `org_id` to table `organizations.id`.


## Files to check:
- `docs\tasks\attachment\database-context.md` for the database logic overall.
- `src\features\aquaflow-ai\aquaflow-ai.guards.ts`
- notes: i am not sure that all related files regarding the organization is here, so if you find some files that is related you can update and modify it.
- check this import files:
      - export { CompleteRegistrationForm } from './components/complete-registration-form'
        export { useCompleteRegistration } from './hooks/use-complete-registration'
        export { isRegistered } from './registration.guards'
        export { registrationSchema } from './registration.schema'
        export { toEdgePayload } from './registration.mapper'
        export {
        REGISTRATION_REDIRECT_PATH,
        POST_REGISTRATION_PATH,
        } from './registration.constants'
            export type {
            RegistrationInput,
            RegistrationPayload,
            RegistrationSessionClaims,
            Gender,
        } from './registration.types'

## Notes
- make sure to update related docs like `ADR` , `docs/DATABASE.md`, `docs/CODEBASE.md` and etc so future AI agent will have a context on this decision and changes.
- Check the saving for the modules:
  -  customers - `src\features\customers\hooks\use-create-customer.ts`
  -  deliveries - the pattern should be the same for others check the folder `src\features\deliveries\hooks\use-create-delivery.ts`
  -  documents - the pattern should be the same for others check the folder `src\features\documents\hooks\use-create-document.ts`
  -  expenses - the pattern should be the same for others check the folder `src\features\expenses\hooks\use-create-expense.ts`
  -  maintenance - the pattern should be the same for others check the folder `src\features\maintenance\hooks\use-create-maintenance.ts`
  -  products - the pattern should be the same for others check the folder `src\features\products\hooks\use-create-product.ts`
