# Supabase Multi-Tenant Architecture (Clerk + Organizations)

This document defines a secure, scalable multi-tenant architecture using:

- Clerk (Authentication only)
- Supabase (Database + Authorization via RLS)
- Custom Organizations + Membership system

---

# 1. OVERVIEW

## Core Principles

- Clerk handles **authentication only**
- Supabase handles **data + authorization**
- Organization access is derived from **membership table**
- `organization_id` is NEVER trusted from the frontend or JWT
- All access control is enforced using RLS

---

# 2. DATABASE SCHEMA

## 2.1 Organizations Table

```sql
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_by text not null, -- Clerk user_id (auth.jwt()->>'sub')
  created_at timestamp default now()
);