# Tasks: Customer Management

## Phase 1: Database

- [ ] Create Supabase migration for `customers`
- [ ] Enable RLS
- [ ] Add select policy
- [ ] Add insert policy
- [ ] Add update policy
- [ ] Add archive policy

## Phase 2: Types and Validation

- [x] Create `customers.types.ts`
- [x] Create `customers.schema.ts`

## Phase 3: API/Service

- [x] Create Supabase query helpers
- [x] Create create customer action
- [x] Create update customer action
- [x] Create archive customer action

## Phase 4: UI

- [x] Create customer form
- [x] Create customers table
- [x] Create customer pages

## Phase 5: Testing

- [x] Test Zod schema
- [x] Test service behavior
- [x] Test protected route (covered by Clerk middleware in `src/proxy.ts`)
- [ ] Test RLS manually or with integration test (see DATABASE.md manual steps)