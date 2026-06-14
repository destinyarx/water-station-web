# Water Station Web

A Water Refilling Station Management System for small water refilling businesses.

The app is designed around real water station workflows: customers, refill services, bottled water products, container handling, deliveries, sales, expenses, inventory, and maintenance.

## Stack

- Next.js App Router
- TypeScript
- Clerk
- Supabase
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- shadcn/ui
- Tailwind CSS
- Vitest

## Development

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Documentation Map

- `AGENTS.md` - primary instructions for AI coding agents
- `CONTEXT.md` - product and domain language
- `docs/CONSTITUTION.md` - non-negotiable engineering rules
- `docs/ARCHITECTURE.md` - architecture and folder structure
- `docs/CODING_STANDARDS.md` - implementation standards
- `docs/SECURITY.md` - auth, RLS, secrets, validation
- `docs/DATABASE.md` - schema and RLS policy documentation
- `docs/DESIGN.md` - design system
- `docs/TESTING.md` - testing rules
- `docs/specs/` - feature specs

## Agent Workflow

AI coding agents should read `AGENTS.md` first, then the relevant docs and feature spec under `docs/specs/`.

Do not implement generic CRUD screens. Keep features scoped to water refilling station workflows, owner/staff permissions, and organization-scoped data.
