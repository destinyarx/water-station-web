# Requirements: Customer Management

## User Story

As an authenticated owner,
I want to create and manage customers,
so that I can track water deliveries.

## Functional Requirements

1. User can create a customer.
2. User can edit a customer.
3. User can archive a customer.
4. User can view only their own customers.
5. User cannot view customers from another owner.

## Acceptance Criteria

- Given I am signed in, when I create a customer, then the customer is saved with my Clerk user ID as the created_by.
- Given I am signed out, when I access customers, then I am redirected to sign in.
- Given another owner has customers, when I query customers, then I cannot see their records.

## Context
### postgres schema structure:
public.customers (
    id UUID primary key default gen_random_uuid(),
    name varchar(100) not null,
    is_business boolean default false,
    contact_number varchar(15),
    facebook_url varchar(255),

    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    street_address varchar(70),
    barangay varchar(70),
    municipality varchar(70),
    province varchar(70),
    full_address varchar(255),

    tenant_id integer not null references public.tenants(id) on delete cascade,
    created_by integer not null references public.users(id) on delete cascade,
    created_at timestamp not null default now(),
    updated_at timestamp,
    deleted_at timestamp
)